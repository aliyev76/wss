import React, { useState } from "react";
import styles from "./EditInfo.module.css";
import { updateProduct } from "../../../../api/product"; // Ensure this is correctly imported

const EditInfo = ({ product, onClose, onSave }) => {
  // Initialize state with correct product data
  const [formData, setFormData] = useState({
    id: product.id, // Product ID for backend updates
    userId: product.userId || "Unknown", // Display userId only
    category: product.category || "N/A", // Default category
    sekans: product.sekans || "N/A", // Default category
    uzunluk: product.uzunluk , // Default category
    saflaştırma: product.saflaştırma , // Default category
    oligoAdi: product.oligoAdi || "",
    scale: product.scale || "",
    modification5: product.modifications?.fivePrime || "",
    modification3: product.modifications?.threePrime || "",
    quantity: product.quantity || 0,
    totalPrice: product.totalPrice || 0,
  
    isOrder: product.isOrder || true,
    isApproved: product.isApproved || false,
    isWorkingOn: product.isWorkingOn || false,
    isFinished: product.isFinished || false,
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit updated data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Structure data to match the backend format
      const updatedProduct = {
        id: formData.id, // Pass product ID explicitly
        category: formData.category,
        oligoAdi: formData.oligoAdi,
        sekans: formData.sekans,
        saflaştırma: formData.saflaştırma,
        uzunluk: formData.uzunluk,
        scale: formData.scale,
        modifications: {
          fivePrime: formData.modification5 || "",
          threePrime: formData.modification3 || "",
        },
        quantity: formData.quantity,
    isOrder: formData.isOrder || true,
    isApproved: formData.isApproved || false,
    isWorkingOn: formData.isWorkingOn || false,
    isFinished: formData.isFinished || false,

    totalPrice: formData.totalPrice,
      };

      console.log("Updating Product:", updatedProduct);

      // Call the backend update function
      await updateProduct(formData.id, updatedProduct);

      // Notify parent component with updated product
      onSave({ ...updatedProduct, id: formData.id, userId: formData.userId });
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Prime">Prime</option>
              <option value="prop">prop</option>
            </select>
          </div>

          {/* Oligo Name */}
          <div className={styles.formGroup}>
            <label>Oligo Name</label>
            <input
              type="text"
              name="oligoAdi"
              value={formData.oligoAdi}
              onChange={handleChange}
            />
          </div>

          {/* Scale */}
          <div className={styles.formGroup}>
            <label>Scale</label>
            <input
              type="text"
              name="scale"
              value={formData.scale}
              onChange={handleChange}
            />
          </div>

          
          {/* sekans */}
          <div className={styles.formGroup}>
            <label>sekans</label>
            <input
              type="text"
              name="sekans"
              value={formData.sekans}
              onChange={handleChange}
            />
          </div>
       {/* saflaştırma */}
       <div className={styles.formGroup}>
            <label>sekans</label>
            <input
              type="text"
              name="saflaştırma"
              value={formData.saflaştırma}
              onChange={handleChange}
            />
          </div>
      {/* uzunluk */}
      <div className={styles.formGroup}>
            <label>uzunluk</label>
            <input
              type="text"
              name="uzunluk"
              value={formData.uzunluk}
              onChange={handleChange}
            />
          </div>


          {/* 5' Modification */}
          <div className={styles.formGroup}>
            <label>5' Modification</label>
            <input
              type="text"
              name="modification5"
              value={formData.modification5}
              onChange={handleChange}
            />
          </div>

          {/* 3' Modification */}
          <div className={styles.formGroup}>
            <label>3' Modification</label>
            <input
              type="text"
              name="modification3"
              value={formData.modification3}
              onChange={handleChange}
            />
          </div>

          {/* Quantity */}
          <div className={styles.formGroup}>
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          {/* Total Price */}
          <div className={styles.formGroup}>
            <label>Total Price</label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleChange}
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className={styles.buttons}>
            <button type="submit" className={styles.saveBtn}>
              Save
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInfo;
