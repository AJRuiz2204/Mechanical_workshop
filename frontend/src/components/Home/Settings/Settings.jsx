import { useState } from "react";
import { Card, Tabs, Typography, Row, Col } from "antd";
import WorkshopSettingsForm from "./WorkshopSettingsForm";
import LaborTaxMarkupSettingsForm from "./LaborTaxMarkupSettingsForm";

const { Title } = Typography;
const { TabPane } = Tabs;

const Settings = () => {
  const [activeKey, setActiveKey] = useState("pdf");

  // Handle tab change event
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    // Responsive container using Row and Col components
    <Row justify="center" style={{ padding: "16px" }}>
      <Col xs={24} sm={24} md={20} lg={16}>
        <Card style={{ margin: 24 }}>
          <Title level={3}>Settings</Title>
          <Tabs activeKey={activeKey} onChange={handleTabChange} type="card">
            <TabPane tab="PDF Settings" key="pdf">
              {/* PDF Settings form */}
              <WorkshopSettingsForm />
            </TabPane>
            <TabPane tab="Labor Settings" key="labor">
              {/* Labor Settings form */}
              <LaborTaxMarkupSettingsForm />
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
  );
};

export default Settings;
