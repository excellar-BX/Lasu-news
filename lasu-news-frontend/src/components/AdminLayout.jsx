import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 bg-[#f5f5f5] min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
