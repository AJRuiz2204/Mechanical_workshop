import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Space } from "antd";
import {
  CarOutlined,
  ToolOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { logoutUser } from "../../services/UserLoginServices";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Carga de usuario desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        console.error("Error parseando usuario");
      }
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  // Definición de todos los menús con roles e íconos de Antd
  const allItems = [
    {
      key: "/vehicle-list",
      icon: <CarOutlined />,
      label: "VEHICLE RECEPTION",
      roles: ["Manager"],
    },
    {
      key: "/diagnostic-list",
      icon: <ToolOutlined />,
      label: "DIAGNOSTIC",
      roles: ["Manager"],
    },
    {
      key: "/estimates",
      icon: <FileTextOutlined />,
      label: "ESTIMATES",
      roles: ["Manager"],
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "REPORTS",
      roles: ["Manager"],
    },
    {
      key: "/technicianDiagnosticList",
      icon: <ProfileOutlined />,
      label: "MY DIAGNOSTICS",
      roles: ["Technician", "Manager"],
    },
    {
      key: "/accounts-receivable",
      icon: <DollarCircleOutlined />,
      label: "PENDING PAYMENTS",
      roles: ["Manager"],
    },
    {
      key: "/payment-list",
      icon: <ClockCircleOutlined />,
      label: "HISTORY",
      roles: ["Manager"],
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "SETTINGS",
      roles: ["Manager"],
    },
    {
      key: "/register-user",
      icon: <UserAddOutlined />,
      label: "ADD USER",
      roles: ["Manager"],
    },
  ];

  // Filtrar según el perfil del usuario
  const menuItems = allItems
    .filter((item) => item.roles.includes(user.profile))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  const handleLogout = () => {
    // Clear all stored data
    localStorage.clear();
    logoutUser();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: "#001529",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
          height: "100vh", // ensure full‑height
          overflowY: "auto", // allow its own scrolling if needed
        }}
      >
        {/* Logo */}
        <div className="logo" style={{ padding: 16, textAlign: "center" }}>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            {collapsed ? "JB" : "JBenz"}
          </Title>
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />

        {/* Sección de usuario al pie */}
        <div style={{ marginTop: "auto", padding: 16, color: "#fff" }}>
          <Space
            direction="horizontal"
            align="center"
            style={{ width: "100%", marginBottom: 12, color: "#fff" }}
          >
            <Avatar
              style={{ backgroundColor: "#1890ff" }}
              icon={<ProfileOutlined />}
            />
            {!collapsed && (
              <div>
                <Text style={{ color: "#fff" }}>Welcome, {user.name}</Text>
                <br />
                <Text style={{ color: "#fff" }}>{user.profile}</Text>
              </div>
            )}
          </Space>
          <Button type="primary" block onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Sider>

      <Layout style={{ flex: 1, height: "100vh", overflow: "hidden" }}>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
