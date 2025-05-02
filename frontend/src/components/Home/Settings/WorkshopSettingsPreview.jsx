import { Card, Typography } from "antd";
import dayjs from "dayjs";
import PropTypes from 'prop-types';

const { Title, Text, Paragraph } = Typography;

/**
 * WorkshopSettingsPreview Component
 *
 * Description:
 * This component displays a preview of the saved workshop settings.
 * It shows information such as workshop name, address, phones, fax, website, email,
 * disclaimer, and the last settings update.
 *
 * Props:
 * - settings: An object containing workshop settings. May include:
 *   - workshopName, address, primaryPhone, secondaryPhone,
 *     fax, websiteUrl, email, disclaimer, lastUpdated
 */
const WorkshopSettingsPreview = ({ settings }) => {
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    // adjust for timezone offset if needed
    return dayjs(dateString).subtract(6, "hour").format("YYYY-MM-DD HH:mm:ss");
  };

  if (!settings) {
    return (
      <Card title="Settings Preview">
        <Paragraph>No settings saved to display.</Paragraph>
      </Card>
    );
  }

  return (
    <Card title="Settings Preview">
      <Title level={5}>{settings.workshopName}</Title>
      <Text strong>Address:</Text> <Text>{settings.address}</Text>
      <br />
      <Text strong>Main Phone:</Text> <Text>{settings.primaryPhone}</Text>
      <br />
      {settings.secondaryPhone && (
        <>
          <Text strong>Secondary Phone:</Text>{" "}
          <Text>{settings.secondaryPhone}</Text>
          <br />
        </>
      )}
      {settings.fax && (
        <>
          <Text strong>Fax:</Text> <Text>{settings.fax}</Text>
          <br />
        </>
      )}
      {settings.websiteUrl && (
        <>
          <Text strong>Website:</Text>{" "}
          <a
            href={settings.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {settings.websiteUrl}
          </a>
          <br />
        </>
      )}
      {settings.email && (
        <>
          <Text strong>Email:</Text> <Text>{settings.email}</Text>
          <br />
        </>
      )}
      {settings.disclaimer && (
        <>
          <Text strong>Disclaimer:</Text> <Text>{settings.disclaimer}</Text>
          <br />
        </>
      )}
      {settings.lastUpdated && (
        <Text italic>
          Last Updated: {formatLastUpdated(settings.lastUpdated)}
        </Text>
      )}
    </Card>
  );
};

WorkshopSettingsPreview.propTypes = {
  settings: PropTypes.shape({
    workshopName: PropTypes.string,
    address: PropTypes.string,
    primaryPhone: PropTypes.string,
    secondaryPhone: PropTypes.string,
    fax: PropTypes.string,
    websiteUrl: PropTypes.string,
    email: PropTypes.string,
    disclaimer: PropTypes.string,
    lastUpdated: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }),
};

export default WorkshopSettingsPreview;
