#include <Arduino.h>
#include <MAX31856.h>
#include <PID_v1.h>
#include <Bounce2.h>

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define FONT_BIG futura_medium_condensed_bt22pt7b
#define FONT_SMALL futura_medium_condensed_bt9pt7b
#include "futuramdcn22pt7b.h"
#include "futuramdcn9pt7b.h"

Adafruit_SSD1306 display;

#define GATE_PIN 12         // PD6
#define ZERO_CROSSING_PIN 7 // PE6
#define DRDY_PIN 10         // PB6
#define SLEEP_PIN 11        // PB7

#define LEFT_BUTTON_PIN 8  // PB4
#define RIGHT_BUTTON_PIN 9 // PB5

volatile unsigned long lastInterrupt = 0;

// Pins for the display
#define SCK SCK
#define CS 4
#define SDI MOSI
#define SDO MISO

// MAX31856 Initial settings (see MAX31856.h and the MAX31856 datasheet)
// The default noise filter is 60Hz, suitable for the USA
#define CR0_INIT (CR0_AUTOMATIC_CONVERSION + CR0_OPEN_CIRCUIT_FAULT_TYPE_K /* + CR0_NOISE_FILTER_50HZ */)
#define CR1_INIT (CR1_AVERAGE_1_SAMPLE + CR1_VOLTAGE_MODE_GAIN_32)
#define MASK_INIT (~(MASK_VOLTAGE_UNDER_OVER_FAULT + MASK_THERMOCOUPLE_OPEN_FAULT))

MAX31856 *temperature;

double currTemp = 0;

unsigned long lastSample = 0;
double wait = 7800;

double targetTemp = 0;

double userTemp = 0;

bool SLEEP = false;
bool OVERRIDE_DISABLE_HEATER = false;
bool USER_DISABLE_HEATER = false;

char displayCurrTempStr[5] = "000.0";
char displaySetTempStr[5] = "000.0";
char displayWaitStr[4] = "0000";
char displaySleepStr[1] = "0";

volatile unsigned long scheduledPulse = 0;
volatile bool doPulse = false;

double Kp = 35, Ki = 26, Kd = 35;

//double Kp = 30, Ki = 16, Kd = 17.5;
PID myPID(&currTemp, &wait, &targetTemp, Kp, Ki, Kd, REVERSE);

Bounce leftDebouncer = Bounce();
Bounce rightDebouncer = Bounce();

#define MAIN_PAGE 0
#define SET_TEMP_PAGE 1

uint8_t CURRENT_PAGE = MAIN_PAGE;

unsigned long lastDisplayUpdate = 0;

void setup()
{
    delay(300);

    /*pinMode(13, OUTPUT);
    digitalWrite(13, HIGH);
    delay(100);
    digitalWrite(13, LOW);
    delay(100);
    digitalWrite(13, HIGH);
    delay(100);
    digitalWrite(13, LOW);*/

    myPID.SetOutputLimits(800, 7800);
    myPID.SetSampleTime(100);

    myPID.SetMode(AUTOMATIC);

    //pinMode(DRDY_PIN, INPUT_PULLUP);
    // make drdy pin input and pulled-up
    DDRB = DDRB & B10111111;
    PORTB = PORTB | B01000000;

    //pinMode(SLEEP_PIN, INPUT_PULLUP);
    // make sleep pin input and pulled-up
    DDRB = DDRB & B01111111;
    PORTB = PORTB | B10000000;

    //pinMode(ZERO_CROSSING_PIN, INPUT_PULLUP);
    // make zero crossing pin input and pulled-up
    DDRE = DDRE & B10111111;
    PORTE = PORTE | B01000000;

    //pinMode(GATE_PIN, OUTPUT);
    // make gate pin output
    DDRD = DDRD | B01000000;

    pinMode(LEFT_BUTTON_PIN, INPUT_PULLUP);
    // setup left button  pb4
    //DDRB = DDRB & B11101111;
    //PORTB = DDRB | B00010000;
    leftDebouncer.attach(LEFT_BUTTON_PIN);
    leftDebouncer.interval(5);

    pinMode(RIGHT_BUTTON_PIN, INPUT_PULLUP);
    // setup right button pb5
    //DDRB = DDRB & B11011111;
    //PORTB = PORTB | B00100000;
    rightDebouncer.attach(RIGHT_BUTTON_PIN);
    rightDebouncer.interval(5);

    temperature = new MAX31856(SDI, SDO, CS, SCK);

    // Initializing the MAX31855's registers
    temperature->writeRegister(REGISTER_CR0, CR0_INIT);
    temperature->writeRegister(REGISTER_CR1, CR1_INIT);
    temperature->writeRegister(REGISTER_MASK, MASK_INIT);

    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();

    display.setTextWrap(false);
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);

    updateDisplay();

    attachInterrupt(digitalPinToInterrupt(ZERO_CROSSING_PIN), zeroCrossingInterrupt, RISING);
}

// 0 == not waiting for temp
// 1 == waiting for first bogus
// 2 == waiting for second bogus
// 3 == waiting for third bogus
// when got third bogus in state == 2, go to 0
uint8_t TEMP_GRAB_STATE = 0;

void loop()
{
    leftDebouncer.update();
    rightDebouncer.update();

    if (leftDebouncer.fell())
    {
        USER_DISABLE_HEATER = !USER_DISABLE_HEATER;
    }
    else if (rightDebouncer.fell())
    {
        switch (CURRENT_PAGE)
        {
            case MAIN_PAGE:
            {
                CURRENT_PAGE = SET_TEMP_PAGE;
                break;
            }
            case SET_TEMP_PAGE:
            {
                CURRENT_PAGE = MAIN_PAGE;

                targetTemp = userTemp;

                break;
            }
        }
    }

    bool didSampleTemp = false;

    if (TEMP_GRAB_STATE == 0)
    {
        if (doPulse && !SLEEP && !OVERRIDE_DISABLE_HEATER && !USER_DISABLE_HEATER)
        {
            if (micros() >= scheduledPulse)
            {
                doPulse = false;

                digitalWrite(GATE_PIN, HIGH);
                digitalWrite(GATE_PIN, LOW);

                /*PORTD = PORTD | B01000000;
                delayMicroseconds(2);
                PORTD = PORTD & B10111111;*/
            }
        }

        if (millis() - lastSample > 400)
        {
            //noInterrupts();

            TEMP_GRAB_STATE++;

            getRidOfBogusReading();
        }
    }
    else if (TEMP_GRAB_STATE < 4)
    {
        if (!(PINB & B01000000))
        {
            TEMP_GRAB_STATE++;
            getRidOfBogusReading();
        }
    }
    else
    {
        // we got third bogus...let's update for real

        currTemp = readTemp();

        // check if sleep pin is asserted

        SLEEP = !(PINB & B10000000);
        //SLEEP = !digitalRead(SLEEP_PIN);

        if (currTemp > 999.9)
        {
            if (SLEEP)
                currTemp = 0;
            else
            {
                OVERRIDE_DISABLE_HEATER = true;
                currTemp = 999.9;
            }
        }
        else if (currTemp < 0)
        {
            currTemp = 0;
        }
        else
        {
            OVERRIDE_DISABLE_HEATER = false;
        }

        myPID.SetSampleTime(millis() - lastSample);

        lastSample = millis();

        didSampleTemp = true;

        TEMP_GRAB_STATE = 0;

        if (CURRENT_PAGE == SET_TEMP_PAGE)
        {
            userTemp = getUserTemp();
        }

        // we can now re-enable interrupts
        //interrupts();
    }

    if (!SLEEP && !OVERRIDE_DISABLE_HEATER && !USER_DISABLE_HEATER && currTemp != 0)
        myPID.Compute();

    // update more quickly if we're accepting user input

    /*if (CURRENT_PAGE == SET_TEMP_PAGE && millis() - lastDisplayUpdate >= 20)
    {
        didSampleTemp = true;
        userTemp = getUserTemp();
    }*/

    if (didSampleTemp)
    {
        updateDisplay();
    }
}

void getRidOfBogusReading()
{
    readTemp();
    delayMicroseconds(100);
    /*while (PINB & B01000000)
    //while (digitalRead(DRDY_PIN))
    {
        ;
    }*/
}

void updateDisplay()
{
    display.clearDisplay();

    if (CURRENT_PAGE == MAIN_PAGE)
        drawMainPage();
    else if (CURRENT_PAGE == SET_TEMP_PAGE)
        drawSetTempPage();

    display.display();

    lastDisplayUpdate = millis();
}

void drawMainPage()
{
    display.setFont(&FONT_BIG);

    dtostrf(currTemp, 5, 1, displayCurrTempStr);

    display.setCursor(25, 36);
    display.print(displayCurrTempStr);

    display.setFont(&FONT_SMALL);

    display.setCursor(110, 24);
    display.print("F");

    dtostrf(targetTemp, 5, 1, displaySetTempStr);

    display.setCursor(48, 60);
    display.print(displaySetTempStr);

    display.setFont();

    dtostrf(wait, 4, 0, displayWaitStr);

    display.setCursor(102, 52);
    display.print(displayWaitStr);

    dtostrf(SLEEP, 1, 0, displaySleepStr);

    display.setCursor(1, 52);
    display.print(displaySleepStr);

    if (OVERRIDE_DISABLE_HEATER || USER_DISABLE_HEATER)
        display.invertDisplay(true);
    else
        display.invertDisplay(false);
}

void drawSetTempPage()
{
    display.setFont(&FONT_BIG);

    dtostrf(userTemp, 5, 1, displayCurrTempStr);

    display.setCursor(25, 36);
    display.print(displayCurrTempStr);

    display.setFont(&FONT_SMALL);

    display.setCursor(110, 24);
    display.print("F");

    display.setCursor(48, 60);
    display.print("SET");
}

void zeroCrossingInterrupt()
{
    if (!SLEEP)
    {
        if (millis() - lastInterrupt > 1)
        {
            lastInterrupt = millis();

            doPulse = true;

            scheduledPulse = micros() + wait;
        }
    }
}

double getUserTemp()
{
    return mapdouble(analogRead(A0), 0, 1023, 300, 700);
}

double readTemp()
{
    return 122.5438816 + 5.66934596 * temperature->readThermocoupleVoltage();
}

double mapdouble(double x, double in_min, double in_max, double out_min, double out_max)
{
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}