import React, { useState } from "react";
import AdminTables from "../../../../components/OrderComponent/AdminComponent/AdminTables/AdminTables";

const AdminSynthingOrders = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Define filter condition for synthing orders
  const filterCondition = (row) => {
    const isWorkingOnOnly = row.isWorkingOn && !row.isFinished; // Only "working on" and not finished
    const matchesCategory =
      categoryFilter === "all" || row.category?.toLowerCase() === categoryFilter.toLowerCase();
    return isWorkingOnOnly && matchesCategory;
  };

  return (
    <div>
      <h1>Synthing Orders</h1>
      {/* Filter Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setCategoryFilter("all")}>All</button>
        <button onClick={() => setCategoryFilter("prime")}>Primer</button>
        <button onClick={() => setCategoryFilter("prop")}>Prop</button>
      </div>
      {/* Pass filterCondition as a prop */}
      <AdminTables filterCondition={filterCondition} />
    </div>
  );
};

export default AdminSynthingOrders;

