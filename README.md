This is a project I've been working on for a little bit. Any questions are very welcome!

It's an "equivalent performance" JBC T245 soldering iron stand.

## Video in-action
[YouTube Video](https://www.youtube.com/watch?v=Gup-r7FQM7E)

## Schematics & PCB Layout
https://easyeda.com/Muny/JBC-T245-Iron-Controller

## Pictures
<img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/front.jpg" alt="Front" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/profile.jpg" alt="Profile" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/rear.jpg" alt="Rear" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/assembly-1.jpg" alt="Assembly 1" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/assembly-2.jpg" alt="Assembly 2" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/assembly-3.jpg" alt="Assembly 3" width="64">

<img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/assembly-4.jpg" alt="Assembly 4" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/assembly-5.jpg" alt="Assembly 5" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/in-use.jpg" alt="In Use" width="64"> <img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/pcb-bare.jpg" alt="PCB Bare" width="64">
<img src="https://raw.githubusercontent.com/Muny-/DIY-JBC-T245-Station/master/pics/pcb-assembled.jpg" alt="PCB Assembled" width="64">

## About the Design

The case was designed in OpenJSCAD and printed on a FormLabs Form 2.

It uses:
* A 100VA 120v to 2x12V toroidal transformer (with the two 12v outputs in series for 24v)
* A simple isolated triac driver circuit
* A simple isolated zero crossing detector circuit
* A MAX31856 thermocouple amplifier.
     * I expected the thermocouple to be of a common type, but it wasn't. So I'm only using this chip in voltage gain mode, and then plugging in the value to an equation I got by linear-fitting a couple voltage-heat data points when sticking the iron tip into liquids of varying temperature and using the melting points of leaded and lead-free solder. I'm not very worried about accuracy, but it seems to be within 10F. The output isn't linear towards the lower end though, hence the ~120F when it's actually about 80F.
* An Arduino Micro. 
    * The code was the most interesting part. A PID control loop was implemented using the Arduino PID library (very handy!). There is quite a bit of overshoot though, meaning I still need to tune the parameters. 

It responds to heat changes extremely responsively though, as seen in the penny test at the end of the video. 

There is a jack on the back for connection to a micro-switch on a stand to put the iron into sleep mode.

Another interesting part was the final sketch size. The fonts used take up a massive portion of the available space.
