require('utils');

// 140 works
var RES = 15;

function main()
{
  util.init(CSG);

  var split = emptyCase().bisect('y', 2).parts.positive.bisect('z', 0.4);

  var topHalf = split.parts.positive;
  var bottomHalf = split.parts.negative;

  // begin some major hackishness

  var rab = topHalf.bisect('z', 0.05).parts.negative;

  topHalf = topHalf.subtract(
    rab.scale([0.987, 0.987, 1])
  ).subtract(
    rab.scale([0.92, 0.92, 1])
  ).subtract(
    rab.scale([0.91, 0.91, 1])
  ).subtract(
    cube({ size: [1, 1, 1], center: [true, true, false] }).translate([0.5, 0, 0])
  );

  var rab = bottomHalf.bisect('z', 0.35).parts.positive;

  var outerRing = bottomHalf.intersect(
    rab.scale([1.047, 1.047, 1])
  );

  outerRing = outerRing.subtract(
    outerRing.scale([0.987, 0.987, 1])
  ).subtract(
    outerRing.scale([0.97, 0.97, 1])
  ).subtract(
    outerRing.scale([0.98, 0.98, 1])
  ).subtract(
    outerRing.scale([0.96, 0.96, 1])
  ).subtract(
    outerRing.scale([0.95, 0.95, 1])
  ).subtract(
    outerRing.scale([0.94, 0.94, 1])
  ).subtract(
    outerRing.scale([0.955, 0.93, 1])
  ).subtract(
    outerRing.scale([0.965, 0.93, 1])
  ).subtract(
    outerRing.scale([0.93, 0.955, 1])
  ).subtract(
    outerRing.scale([0.93, 0.945, 1])
  );

  bottomHalf = bottomHalf.subtract(outerRing);
  
  // end major hackishness

  return union(
    topHalf,//.translate([0, 0, 0.2]),
    //bottomHalf//,//.bisect('z', 2.4).parts.negative,
    components()
  );

}

function components()
{
  return union(
    toroidalTransformer().translate([0.45, 0, 0.1]),
    powerInlet().translate([1.35, 0, 2.2]),
    pcb().rotateY(-50).translate([-0.5, 0, 2.3]),
    potentiometer().rotateY(-45).translate([-0.8, 0, 2.51]),
    ironConnector().rotateY(-90).translate([-2, 0, 1]),
    display().rotateY(-45).translate([-0.7, 0, 3.52]),
    standConnector().translate([2.0852 - 0.17, 0, 3.7]),
    
    menuButton().rotateY(-45).translate([0, -1, 3.52]),
    menuButton().rotateY(-45).translate([0, 1, 3.52])
  );
}

function menuButton()
{
  return union(
    cylinder({ r: 0.3 / 2, h: 1.2 }).setColor(0.75, 0.75, 0.75)
  )
}

function standConnector()
{
  return union(
    cube({ size: [0.34, 0.36, 0.42], center: [false, true, true] }).setColor(0.1, 0.1, 0.1),
    cylinder({ r: 0.35 / 2, h: 0.015, center: [true, true, false] }).rotateY(90).translate([0.34, 0, 0]).setColor(0.2, 0.2, 0.2),
    cylinder({ r: 0.26 / 2, h: 0.145, center: [true, true, false] }).rotateY(90).translate([0.34 + 0.015, 0, 0]).setColor(0.75, 0.75, 0.75),

    cylinder({ r: 0.45 / 2, h: 0.07, center: [true, true, false] }).rotateY(90).translate([0.34 + 0.015+0.06, 0, 0]).setColor(0.75, 0.75, 0)
  ).subtract(
    union(
      cube({ size: [0.015, 0.35, 0.35], center: [true, true, false] }).translate([0.34 + (0.015 / 2), 0, 0.26 / 2]),
      cube({ size: [0.015, 0.35, 0.35], center: [true, true, false] }).translate([0.34 + (0.015 / 2), 0, -(0.26 / 2)-0.35])
    ).setColor(0.1, 0.1, 0.1)
  );
}

function ironConnector()
{
  return union(
    cube({ size: [0.78, 0.78, 0.08], center: [true, true, false], round: true, radius: [0.1, 0.1, 0] }).setColor(0.15, 0.15, 0.15),
    cylinder({ r: 0.6 / 2, h: 0.375, center: [true, true, false] }).translate([0, 0, 0.08]).setColor(0.1, 0.1, 0.1),
    cube({ size: [0.14, 0.26, 0.38], center: [true, true, false], round: true, radius: [0.025, 0.025, 0] }).translate([0.31, 0, 0.08 - 0.005]).setColor(0.1, 0.1, 0.1),
    cylinder({ r: 0.49 / 2, h: 0.16, center: [true, true, false] }).translate([0, 0, -0.16]).setColor(0.15, 0.15, 0.15),
    cylinder({ r: 0.4 / 2, h: 0.3, center: [true, true, false] }).translate([0, 0, -.16 - 0.3]).setColor(0.75, 0.75, 0.75),
    
    cylinder({ r: 0.1 / 2, h: 0.4, center: [true, true, true] }).translate([0.3, 0.3, 0]).setColor(0.76, 0.76, 0.76),
    cylinder({ r: 0.1 / 2, h: 0.4, center: [true, true, true] }).translate([0.3, -0.3, 0]).setColor(0.76, 0.76, 0.76),
    cylinder({ r: 0.1 / 2, h: 0.4, center: [true, true, true] }).translate([-0.3, 0.3, 0]).setColor(0.76, 0.76, 0.76),
    cylinder({ r: 0.1 / 2, h: 0.4, center: [true, true, true] }).translate([-0.3, -0.3, 0]).setColor(0.76, 0.76, 0.76)
  ).subtract(
    union(
      cylinder({ r: (0.6 - 0.12) / 2, h: 0.375, center: [true, true, false] }).translate([0, 0, 0.08]).setColor(0.1, 0.1, 0.1),
    cube({ size: [0.16, 0.26 - 0.06, 0.375], center: [true, true, false], round: true, radius: [0.025, 0.025, 0] }).translate([0.31 - 0.03, 0, 0.08]).setColor(0.1, 0.1, 0.1),
    cube({ size: [0.49, 0.49, 0.16], center: [true, true, false] }).translate([(0.49 / 2) + 0.21, 0, -0.16]).setColor(0.15, 0.15, 0.15)
    )
  );
}

function potentiometer()
{
  return union(
    cylinder({ r: 0.86 / 2, h: 0.72 }).setColor(0.1, 0.1, 0.1),
    cylinder({ r: 0.865 / 2, h: 0.065 }).translate([0, 0, 0.72 - 0.064]).setColor(0.6, 0.6, 0.6),
    cylinder({ r: 0.42 / 2, h: 0.32 }).translate([0, 0, 0.7]).setColor(0.7, 0.7, 0.7),
    cylinder({ r: 0.26 / 2, h: 0.52 }).translate([0, 0, 0.72+0.32-0.064]).setColor(0.6, 0.6, 0.6)
  );
}

function display()
{
  return union(
    cube({ size: [0.76, 1.07, 0.063], center: [false, true, false] }).translate([0.15, 0, 0.07 + 0.065]).setColor(1, 1, 1, 0.3),
    union(
      cube({ size: [1.08, 1.05, 0.07], center: [false, true, false], round: true, radius: [0.05, 0.05, 0] }).setColor(0.15, 0.55, 0.65),
      cube({ size: [0.76, 1.07, 0.065], center: [false, true, false] }).translate([0.15, 0, 0.07]).setColor(0, 0, 0)
    ),
    // screws
    cylinder({ r: mm(2) / 2, h: 0.5, center: [true, true, false] }).translate([0.07, 0.4, -0.15]),
    cylinder({ r: mm(2) / 2, h: 0.5, center: [true, true, false] }).translate([0.07, -0.4, -0.15]),

    cylinder({ r: mm(2) / 2, h: 0.5, center: [true, true, false] }).translate([0.07+0.92, 0.4, -0.15]),
    cylinder({ r: mm(2) / 2, h: 0.5, center: [true, true, false] }).translate([0.07+0.92, -0.4, -0.15])
  );
}

function pcb()
{
  return union(
    cube({ size: [3.1, 2.3, 0.08], center: [false, true, false] }).color('green'),
    cube({ size: [1.25, 1, 0.7], center: [false, false, false] }).translate([3.1 - 0.15 - 1.25, 0.13, -0.7]).setColor(0.5, 0.5, 0.5),
    cube({ size: [1.95, 0.7, 0.3], center: [false, false, false] }).translate([0.35, -0.9, -0.3]).setColor(0.3, 0.7, 0.8)
  );
}

function powerInlet()
{
  return union(
    cube({ size: [1.05, 2.65, 1.05], center: [false, true, false] }),
    cube({ size: [0.1, 2.65, 1.16], center: [false, true, false] }).translate([1.05,0,-0.05])
  ).setColor(0.25, 0.25, 0.25);
}

function toroidalTransformer()
{
  return union(
    //cylinder({ r: 3.5 / 2, h: 2 }).setColor(0.9, 0.5, 0.4),
    torus({ ri: 0.6, ro: 1.3, fni: 4, roti: 45 }).scale([1, 1, 2 / 0.85]).translate([0, 0, 1]).setColor(0.9, 0.5, 0.4),
    cylinder({ r: 0.25 / 2, h: 2.35 }).translate([0, 0, -(0.35 / 2)]).setColor(0.75, 0.75, 0.75)
  );
}

function rubberFoot()
{
  return cylinder({ r1: 3.45 / 2, r2: 1, h: 2 });
}

function emptyCase()
{
  return union(
    outsideShape().subtract(outsideShape().scale(0.94).translate([0, 0, 0.1])).subtract(
      components()
    ).setColor(0.3, 0.3, 0.3),
    screwMounts().setColor(0.3, 0.3, 0.3),
    // HANDLE
    cube({ size: [0.5, 3.25, 0.7], center: [true, true, false] }).translate([1.35, 0, 5]).subtract(
      cube({ size: [0.5, 2.75, 0.5], center: [true, true, false] }).rotateY(90).fillet(-0.1, 'z-').fillet(-0.1, 'z+').rotateY(-90).translate([1.35, 0, 5])
    ).fillet(-0.1, 'z-').fillet(0.1, 'z+').setColor(0.3, 0.3, 0.3),

    // Transformer countersink filler
    cylinder({ r: 0.75 / 2, h: 0.35 }).fillet(-0.2, 'z-').subtract(
      cylinder({ r: 0.6 / 2, h: 0.25 })
    ).subtract(
      cylinder({ r: 0.25 / 2, h: 2.35 }).translate([0, 0, -(0.35 / 2)]).setColor(0.75, 0.75, 0.75)
    ).translate([0.45, 0, 0.1]).setColor(0.3, 0.3, 0.3)
  ).subtract(
    union(
      screwHoles(),
      cylinder({ r: 0.6 / 2, h: 0.1}).translate([0.45, 0, 0])
    )
  );
}

function screwMounts()
{
  return union(
    // M3x10mm
    cylinder({ r: 0.25 / 2, h: 0.55 }).fillet(-0.09, 'z-').fillet(0.05, 'z+').translate([2.15, -1.75, 0.3]),
    cylinder({ r: 0.25 / 2, h: 0.55 }).fillet(-0.09, 'z-').fillet(0.05, 'z+').translate([2.15, 1.75, 0.3]),

    cylinder({ r: 0.25 / 2, h: 0.55 }).fillet(-0.09, 'z-').fillet(0.05, 'z+').translate([-1.16, -1.36, 0.3]).bisect('y', -0.1, -64, 'z', 0).parts.negative,
    cylinder({ r: 0.25 / 2, h: 0.55 }).fillet(-0.09, 'z-').fillet(0.05, 'z+').translate([-1.16, 1.36, 0.3]).bisect('y', 0.1, 64, 'z', 0).parts.positive,

    cylinder({ r: 0.44 / 2, h: 0.2 }).translate([2.15, -1.75, 0.1]),
    cylinder({ r: 0.44 / 2, h: 0.2 }).translate([2.15, 1.75, 0.1]),

    cylinder({ r: 0.44 / 2, h: 0.2 }).translate([-1.17, -1.37, 0.1]).bisect('y', 0, -45, 'z', -0.2).parts.negative,
    cylinder({ r: 0.44 / 2, h: 0.2 }).translate([-1.17, 1.37, 0.1]).bisect('y', 0, 45, 'z', -0.7).parts.positive
  );
}

function screwHoles()
{
  return union(
    cylinder({ r: mm(3 - 0.1) / 2, h: 0.45 }).translate([2.15, -1.75, 0.2]),
    cylinder({ r: mm(3 - 0.1) / 2, h: 0.45 }).translate([2.15, 1.75, 0.2]),

    cylinder({ r: mm(3 - 0.1) / 2, h: 0.45 }).translate([-1.17, -1.37, 0.2]),
    cylinder({ r: mm(3 - 0.1) / 2, h: 0.45 }).translate([-1.17, 1.37, 0.2]),
    
    // flush

    cylinder({ r: 0.34 / 2, h: 0.2 }).translate([2.15, -1.75, 0]),
    cylinder({ r: 0.34 / 2, h: 0.2 }).translate([2.15, 1.75, 0]),

    cylinder({ r: 0.34 / 2, h: 0.2 }).translate([-1.17, -1.37, 0]),
    cylinder({ r: 0.34 / 2, h: 0.2 }).translate([-1.17, 1.37, 0])
  );
}

function outsideShape()
{
  return union(
    cube({ size: [2.6, 4, 5], round: true, radius: [0.2, 0.2, 0], fn: RES, center: [false, true, false] }).translate([-.2, 0, 0]),
    cylinder({ r: 2, h: 5, fn: RES }),
    cube({ size: [0.05, 0.78, 0.78], round: true, radius: [0, 0.1, 0.1], center: [false, true, false], fn: RES }).subtract(
      cube({ size: [0.05, 0.78, 0.78], center: [false, true, false] }).translate([-0.04, 0, 0])
    ).translate([-2.01, 0, 1 - (0.78 / 2)])
  ).subtract(
    union(
      cube({ size: [6, 4, 3], center: [true, true, false] }).rotateY(-45).translate([0, 0, 4.5])
    )
  ).fillet(0.2, 'z+').setColor(0.3, 0.3, 0.3);
}

// converts millimeters to inches
function mm(millimeters)
{
  return millimeters * 0.0393701;
}
