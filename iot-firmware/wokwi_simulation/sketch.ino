/**
 * NexaDairy (pvt) Ltd. - ESP32 Smart Farm IoT Firmware
 * Wokwi Simulation Sketch (Arduino C++)
 * 
 * Hardware Connected:
 * - DHT22 (Pin 15): Temperature & Humidity
 * - HC-SR04 (Trig: 5, Echo: 18): Water Tank Level
 * - SG90 Servo (Pin 13): Automated Feeding / Pasture Gate
 * - Relay Module (Pin 4): Barn Cooling Fan Actuator
 * - Push Button (Pin 19): RFID Tag Scanner Emulation
 * - Potentiometer (Pin 34): Milk Flowmeter Emulation
 * - SSD1306 OLED (I2C SDA: 21, SCL: 22): Local Telemetry Screen
 * - Status LED (Pin 2) & Alert LED (Pin 23)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Pins Definition
#define DHT_PIN 15
#define DHT_TYPE DHT22
#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_PIN 13
#define RELAY_PIN 4
#define RFID_BTN_PIN 19
#define FLOWMETER_PIN 34
#define STATUS_LED_PIN 2
#define ALERT_LED_PIN 23

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Backend Server Configuration (Wokwi uses Wokwi-GUEST Wi-Fi)
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* backendUrl = "http://host.wokwi.internal:5000/api/sensors/telemetry";

DHT dht(DHT_PIN, DHT_TYPE);
Servo gateServo;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const char* cowTags[] = {
  "COW-RFID-101", "COW-RFID-102", "COW-RFID-103", "COW-RFID-104", "COW-RFID-105",
  "COW-RFID-106", "COW-RFID-107", "COW-RFID-108", "COW-RFID-109", "COW-RFID-110",
  "COW-RFID-111", "COW-RFID-112", "COW-RFID-113", "COW-RFID-114", "COW-RFID-115"
};
int totalTags = 15;
int currentTagIndex = 0;

unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = 4000; // 4 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- NexaDairy AIoT ESP32 Firmware Starting ---");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(ALERT_LED_PIN, OUTPUT);
  pinMode(RFID_BTN_PIN, INPUT_PULLUP);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, HIGH);
  digitalWrite(ALERT_LED_PIN, LOW);

  dht.begin();
  gateServo.attach(SERVO_PIN);
  gateServo.write(0); // Gate Closed (0 deg)

  // Initialize OLED Display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 10);
    display.println("NexaDairy AIoT");
    display.setCursor(10, 30);
    display.println("ESP32 Connected");
    display.display();
  }

  // Connect to Wi-Fi in Wokwi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

float getWaterLevelPercentage() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return 75.0; // fallback

  float distanceCm = duration * 0.034 / 2;
  // Tank height 100cm: 10cm distance = 90% full, 80cm distance = 20% full
  float levelPercent = constrain(map(distanceCm, 80, 10, 10, 100), 0, 100);
  return levelPercent;
}

void updateOledScreen(float temp, float humidity, float waterLevel, const char* scannedTag) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(0, 0);
  display.println("NexaDairy (pvt) Ltd.");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setCursor(0, 16);
  display.print("Temp : "); display.print(temp, 1); display.println(" C");

  display.setCursor(0, 28);
  display.print("Hum  : "); display.print(humidity, 1); display.println(" %");

  display.setCursor(0, 40);
  display.print("Water: "); display.print(waterLevel, 0); display.println(" %");

  display.setCursor(0, 52);
  if (scannedTag != NULL) {
    display.print("RFID: "); display.println(scannedTag);
  } else {
    display.println("Gate: AUTO (CLOSED)");
  }

  display.display();
}

void sendTelemetryPayload(const char* sensorType, float value, const char* unit) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(backendUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"deviceId\":\"ESP32_BARN_NODE_1\",\"sensorType\":\"" + String(sensorType) +
                  "\",\"value\":" + String(value) + ",\"unit\":\"" + String(unit) + "\",\"location\":\"Main Barn Section A\"}";

    int httpResponseCode = http.POST(json);
    http.end();
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Read sensors
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  float water = getWaterLevelPercentage();

  if (isnan(temp)) temp = 24.2;
  if (isnan(hum)) hum = 67.5;

  // Anomaly Automation: Fan Relay
  if (temp > 28.5) {
    digitalWrite(RELAY_PIN, HIGH); // Turn ON fans
    digitalWrite(ALERT_LED_PIN, HIGH);
  } else {
    digitalWrite(RELAY_PIN, LOW); // Turn OFF fans
    digitalWrite(ALERT_LED_PIN, LOW);
  }

  // Check RFID Button Trigger
  const char* activeScan = NULL;
  if (digitalRead(RFID_BTN_PIN) == LOW) {
    activeScan = cowTags[currentTagIndex];
    currentTagIndex = (currentTagIndex + 1) % totalTags;

    Serial.println("\n[RFID EVENT] Tag Scanned ➔ " + String(activeScan));
    // Simulate gate opening for the cow
    gateServo.write(90); // Open gate
    delay(1000);
    gateServo.write(0);  // Close gate
  }

  // Periodic Telemetry Transmission
  if (currentMillis - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = currentMillis;

    Serial.printf("[ESP32 Telemetry] Temp: %.1f C | Hum: %.1f %% | Water Tank: %.0f %%\n", temp, hum, water);
    updateOledScreen(temp, hum, water, activeScan);

    sendTelemetryPayload("temperature", temp, "°C");
    sendTelemetryPayload("humidity", hum, "%");
    sendTelemetryPayload("water_level", water, "%");
  }

  delay(100);
}
