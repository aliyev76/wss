import React, { useState } from "react";
import AdminTables from "../../../../components/OrderComponent/AdminComponent/AdminTables/AdminTables";

const AdminApprovedOrders = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filterCondition = (row) => {
    const isApprovedOnly = row.isApproved && !row.isWorkingOn && !row.isFinished; // Only approved
    const matchesCategory =
      categoryFilter === "all" || row.category?.toLowerCase() === categoryFilter.toLowerCase();
    return isApprovedOnly && matchesCategory;
  };

  return (
    <div>
      <h1>Approved Orders</h1>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setCategoryFilter("all")}>All</button>
        <button onClick={() => setCategoryFilter("prime")}>Primer</button>
        <button onClick={() => setCategoryFilter("prop")}>Prop</button>
      </div>
      <AdminTables filterCondition={filterCondition} />
    </div>
  );
};

export default AdminApprovedOrders;

