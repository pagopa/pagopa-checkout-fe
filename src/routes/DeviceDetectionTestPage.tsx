// TODO remove this page in final PR

/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import {
  getDeviceInfo,
  getOperatingSystem,
  getBrowserType,
  getDeviceType,
  isTouchDevice,
  isApplePaySupported,
  isGooglePaySupported,
  type DeviceInfo,
} from "../utils/device/deviceDetection";

const DeviceDetectionTestPage: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const info = getDeviceInfo();
    setDeviceInfo(info);

    // log to console for debugging
    console.log("Device Detection Results:", info);
    console.log("Individual function results:", {
      operatingSystem: getOperatingSystem(),
      browserType: getBrowserType(),
      deviceType: getDeviceType(),
      isTouchDevice: isTouchDevice(),
      isApplePaySupported: isApplePaySupported(),
      isGooglePaySupported: isGooglePaySupported(),
    });
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
  };

  const getChipColor = (value: string) => {
    if (value === "UNKNOWN") {
      return "default";
    }
    if (value === "MOBILE") {
      return "success";
    }
    if (value === "TABLET") {
      return "warning";
    }
    if (value === "DESKTOP") {
      return "info";
    }
    return "primary";
  };

  if (!deviceInfo) {
    return <Typography>Loading device information...</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Device Detection Test Page
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates the device detection utility created for
        CHK-4433. Open DevTools to see the device detection code in the Sources
        panel. Use DevTool device emulation to mock user agents and click
        Refresh Detection to see the updated device/OS/browser info.
      </Typography>

      <Button variant="contained" onClick={handleRefresh} sx={{ mb: 3 }}>
        Refresh Detection
      </Button>

      <Grid container spacing={3}>
        {/* Basic Device Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Device Type
                    </Typography>
                    <Chip
                      label={deviceInfo.deviceType}
                      color={getChipColor(deviceInfo.deviceType)}
                      size="medium"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Operating System
                    </Typography>
                    <Chip
                      label={deviceInfo.operatingSystem}
                      color={getChipColor(deviceInfo.operatingSystem)}
                      size="medium"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Browser Type
                    </Typography>
                    <Chip
                      label={deviceInfo.browserType}
                      color={getChipColor(deviceInfo.browserType)}
                      size="medium"
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* screen information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Screen Information
              </Typography>

              <Typography variant="body1" component="div">
                <strong>Width:</strong> {deviceInfo.screenWidth}px
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Height:</strong> {deviceInfo.screenHeight}px
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Touch Device:</strong>{" "}
                <Chip
                  label={deviceInfo.isTouchDevice ? "Yes" : "No"}
                  color={deviceInfo.isTouchDevice ? "success" : "default"}
                  size="small"
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* payment method support */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method Support
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1">Apple Pay:</Typography>
                  <Chip
                    label={
                      isApplePaySupported() ? "Supported" : "Not Supported"
                    }
                    color={isApplePaySupported() ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1">Google Pay:</Typography>
                  <Chip
                    label={
                      isGooglePaySupported() ? "Supported" : "Not Supported"
                    }
                    color={isGooglePaySupported() ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* user agent */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Agent String
              </Typography>

              <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    fontSize: "0.8rem",
                  }}
                >
                  {deviceInfo.userAgent || "User agent not available"}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* debug information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Debug Information
              </Typography>

              <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {JSON.stringify(deviceInfo, null, 2)}
                </Typography>
              </Paper>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Open DevTools Console to see detailed logging output
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceDetectionTestPage;
