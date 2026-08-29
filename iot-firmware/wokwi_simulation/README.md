# NexaDairy AIoT - Wokwi ESP32 Hardware Simulation

This directory contains the ready-to-run **Wokwi.io** project files to simulate the entire NexaDairy ESP32 hardware network in the cloud.

---

## 1. List of IoT Hardware & Components in Wokwi

| Component | Wokwi Part Type | Role in Smart Dairy Farm | Connected ESP32 Pin |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | `wokwi-esp32-devkit-v1` | Central IoT node controller & Wi-Fi gateway | Core Board |
| **Barn Climate Sensor** | `wokwi-dht22` | Measures barn temperature & humidity | **GPIO 15** |
| **Water Level Sensor** | `wokwi-hc-sr04` | Ultrasonic distance sensor inside water tank | **Trig: 5**, **Echo: 18** |
| **Feeding Gate Actuator**| `wokwi-servo` (SG90) | Automated feeding / pasture gate servo | **GPIO 13 (PWM)** |
| **Cooling Fan Actuator**| `wokwi-relay-module` | Relay driving ventilation cooling fans | **GPIO 4** |
| **RFID Ear Tag Scanner**| `wokwi-pushbutton` | Simulates cow RFID ear tag scan event | **GPIO 19** |
| **Milk Flowmeter** | `wokwi-potentiometer` | Analog flow sensor measuring milk volume | **GPIO 34 (ADC)** |
| **OLED Telemetry Screen**| `wokwi-ssd1306` (128x64) | Local barn status display | **SDA: 21**, **SCL: 22** |
| **System Status LED** | `wokwi-led` (Green) | Wi-Fi connected / Normal operational state | **GPIO 2** |
| **Anomaly Alert LED** | `wokwi-led` (Red) | High temperature / low water alarm | **GPIO 23** |

---

## 2. Pinout Connection Diagram

```text
                           +------------------------+
                           |  ESP32 DevKit v1 Node  |
                           +------------------------+
                               |     |     |     |
             +-----------------+     |     |     +------------------+
             |                       |     |                        |
      [ GPIO 15 ]              [ GPIO 5, 18 ]  [ GPIO 13 ]             [ GPIO 4 ]
             |                       |             |                        |
      +--------------+        +--------------+ +---------------+   +----------------+
      | DHT22 Sensor |        | HC-SR04 Tank | | SG90 Gate     |   | Fan Relay Mod. |
      | (Temp & Hum) |        | (Water Level)| | (Servo Motor) |   | (Ventilation)  |
      +--------------+        +--------------+ +---------------+   +----------------+
             |                       |             |                        |
             +-----------------------+-------------+------------------------+
                                     |
                       [ I2C SDA: 21, SCL: 22 ] ➔ SSD1306 OLED Display
                       [ GPIO 19 ] ➔ Push Button (RFID Scanner Emulation)
                       [ GPIO 34 ] ➔ Potentiometer (Milk Flowmeter)
                       [ GPIO 2  ] ➔ Green LED (Status)
                       [ GPIO 23 ] ➔ Red LED (Alert Alarm)
```

---

## 3. Required Wokwi Libraries (`libraries.txt`)

When setting up your Wokwi project, add these libraries in the **Library Manager** tab:
```text
DHT sensor library for ESPx
Adafruit SSD1306
Adafruit GFX Library
ESP32Servo
```

---

## 4. How to Run in Wokwi.io

1. Open **[https://wokwi.com](https://wokwi.com)** in your browser.
2. Select **ESP32** -> **Arduino**.
3. Replace the editor files:
   - Paste the contents of `diagram.json` into the **diagram.json** tab.
   - Paste the contents of `sketch.ino` into the **sketch.ino** tab.
4. Click the **▶ Play (Start Simulation)** button.
5. **Interactive Controls**:
   - Click the **DHT22** sensor to drag the temperature slider above 28.5°C -> Watch the **Fan Relay** activate and the **Red Alert LED** turn ON!
   - Click the **HC-SR04** sensor to change distance -> Watch the water tank level update on the OLED screen.
   - Press the green **RFID Scan** button -> Watch the **SG90 Gate Servo** open and display the scanned cow tag (`COW-RFID-101` to `115`) on the OLED screen!
