import Product from '../models/Product.js';
import User from '../models/User.js'; // Ensure you have a User model to fetch user data
import transporter from '../services/email/transporter.js';
import submissionConfirmationTemplate from '../services/email/templates/submissionConfirmationTemplate.js';
import { sendApprovedEmail, sendWorkingOnEmail, sendFinishedEmail } from '../services/email/emailService.js';
export const addProduct = async (req, res) => {
  const { products } = req.body;
  const userId = req.user?.id; // Assume this is added by authentication middleware

  try {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "No products provided." });
    }

    // Fetch user data from the database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const createdProducts = await Promise.all(
      products.map(async (product) => {
        const {
          category,
          modifications,
          saflaştırma,
          scale,
          totalPrice,
          oligoAdi,
          quantity,
          sekans,
          uzunluk,
        } = product;

        return await Product.create({
          category,
          modifications,
          saflaştırma: category === "prime" ? saflaştırma : null,
          scale,
          totalPrice,
          oligoAdi,
          userId,
          sekans:sekans || "",
          uzunluk,
          quantity: quantity || 1,
          isOrder: true, // Set isOrder to true when the product is added
        });
      })
    );

    // Send confirmation email
    const mailOptions = {
      from: `"Polgen Order Confirmation" <${process.env.SMTP_USER}>`,
      to: user.email, // Use email from the database
      subject: "Order Confirmation",
      html: submissionConfirmationTemplate(user.username, createdProducts),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);

    res.status(201).json({
      message: "Products added successfully.",
      products: createdProducts,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product." });
  }
};



//
//
//
// Get All Products
export const getProducts = async (req, res) => {
  const userRole = req.user?.role; // Authenticated user's role
  const userId = req.query.userId || req.user?.id; // Query param or authenticated user's ID
  const isSpecificUser = req.query.isSpecificUser === 'true'; // Query flag to determine the data to fetch

  try {
    let products;

    if (userRole === 'admin') {
      // Admin requesting all or specific user products
      if (isSpecificUser && userId) {
        products = await Product.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
        });
      } else {
        products = await Product.findAll({
          order: [['createdAt', 'DESC']],
        });
      }
    } else if (userRole === 'user') {
      // Regular user requesting their own products
      products = await Product.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized access.' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};



// Get Product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  const { id } = req.params; // Can be 'all', a single ID, or an array of IDs
  console.log("Update Request ID:", id); // Debug log

  const {
    category, modifications, saflaştırma, scale, totalPrice, oligoAdi, quantity, sekans, uzunluk, isOrder, isApproved, isWorkingOn, isFinished,
  } = req.body;

  try {
    if (id === 'all') {
      // Bulk update for multiple products
      const { productIds } = req.body; // Array of product IDs to update
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: 'No product IDs provided for bulk update.' });
      }

      const updatedProducts = [];
      const userMap = {}; // Map users to their products for email grouping

      for (const productId of productIds) {
        const product = await Product.findByPk(productId);
        if (!product) continue;

        const user = await User.findByPk(product.userId);
        if (!user) continue;

        // Update the product
        await product.update({
          ...(category && { category }),
          ...(modifications && { modifications }),
          ...(saflaştırma && { saflaştırma }),
          ...(scale && { scale }),
          ...(totalPrice && { totalPrice }),
          ...(oligoAdi && { oligoAdi }),
          ...(sekans && { sekans }),
          ...(uzunluk && { uzunluk }),
          ...(quantity !== undefined && { quantity }),
          ...(isOrder !== undefined && { isOrder }),
          ...(isApproved !== undefined && { isApproved }),
          ...(isWorkingOn !== undefined && { isWorkingOn }),
          ...(isFinished !== undefined && { isFinished }),
        });

        // Add to updated products
        updatedProducts.push(product.toJSON());

        // Group by user for email notifications
        const username = user.username;
        const userEmail = user.email;
        if (!userMap[userEmail]) {
          userMap[userEmail] = { username, products: [] };
        }
        userMap[userEmail].products.push(product.toJSON());
      }

      // Send grouped emails
      for (const [userEmail, { username, products }] of Object.entries(userMap)) {
        if (isApproved) {
          await sendApprovedEmail(userEmail, username, products);
        }
        if (isWorkingOn) {
          await sendWorkingOnEmail(userEmail, username, products);
        }
        if (isFinished) {
          await sendFinishedEmail(userEmail, username, products);
        }
      }

      return res.status(200).json({
        message: 'Products updated successfully.',
        updatedProducts,
      });
    } else {
      // Single product update
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const user = await User.findByPk(product.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const username = user.username;
      const userEmail = user.email;

      // Capture previous product status
      const previousStatus = {
        isApproved: product.isApproved,
        isWorkingOn: product.isWorkingOn,
        isFinished: product.isFinished,
      };

      // Update the product
      await product.update({
        ...(category && { category }),
        ...(modifications && { modifications }),
        ...(saflaştırma && { saflaştırma }),
        ...(scale && { scale }),
        ...(totalPrice && { totalPrice }),
        ...(oligoAdi && { oligoAdi }),
        ...(quantity !== undefined && { quantity }),
        ...(sekans && { sekans }),
        ...(uzunluk && { uzunluk }),
        ...(isOrder !== undefined && { isOrder }),
        ...(isApproved !== undefined && { isApproved }),
        ...(isWorkingOn !== undefined && { isWorkingOn }),
        ...(isFinished !== undefined && { isFinished }),
      });

      const productDetails = [product.toJSON()]; // Convert product to JSON for use in email templates

      // Send emails based on status changes
      if (isApproved && !previousStatus.isApproved) {
        await sendApprovedEmail(userEmail, username, productDetails);
      }
      if (isWorkingOn && !previousStatus.isWorkingOn) {
        await sendWorkingOnEmail(userEmail, username, productDetails);
      }
      if (isFinished && !previousStatus.isFinished) {
        await sendFinishedEmail(userEmail, username, productDetails);
      }

      return res.status(200).json({ message: 'Product updated successfully.', product });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
};



//
//
//
// Delete Product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
// Update Product
  }
};
