from pathlib import Path
from html import escape
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--out',type=Path,default=Path(__file__).resolve().parent/'generated-diagrams')
OUT=parser.parse_args().out
OUT.mkdir(parents=True,exist_ok=True)
PAPER='#faf8f2'; INK='#202d2b'; MUTED='#57615a'; LINE='#d2d5ca'; TEAL='#245c50'; COPPER='#a64d2d'; PALE='#f0e0d4'
def text(x,y,s,size=22,color=INK,weight=400,anchor='start',cls=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}" class="{cls}">{escape(s)}</text>'
def lines(x,y,ss,size=22,color=INK,weight=400,gap=30):
    return ''.join(text(x,y+i*gap,s,size,color,weight) for i,s in enumerate(ss))
def rect(x,y,w,h,fill=PAPER,stroke=LINE,rx=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def line(x1,y1,x2,y2,color=TEAL,dash='',arrow=False,width=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def circle(x,y,r,fill=PALE,stroke=COPPER,dash=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="3"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
def doc(name,title,desc,height,parts):
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{TEAL}"/></marker></defs><style>text{{font-family:Arial,Helvetica,sans-serif}} .mono{{font-family:ui-monospace,monospace;letter-spacing:1px}}</style><rect width="1280" height="{height}" fill="{PAPER}"/>'''+''.join(parts)+'</svg>'
    (OUT/name).write_text(s)
# MEASUREMENT BENCH
p=[]
p += [text(44,42,'01 / PROPOSED MEASUREMENT BENCH',18,TEAL,600,cls='mono'),text(44,86,'Move the specimen. Preserve the measurement.',35,INK,600),text(44,120,'Top view · one sphere shown at two successive stations · schematic, not to scale',21,MUTED)]
p += [rect(180,270,940,260,'#eceee5',TEAL),text(205,308,'LEVEL TABLE  /  2 m illustrative length',19,TEAL,600,cls='mono')]
p += [line(180,570,1120,570),line(180,560,180,580),line(1120,560,1120,580),text(650,605,'Record actual coordinates and table height at each station',21,MUTED,anchor='middle')]
# A and B spheres, support carrier and translation
for x,lab,ghost in [(390,'A',False),(920,'B',True)]:
    p += [circle(x,420,62,PAPER if ghost else PALE,COPPER,'8 6' if ghost else ''),circle(x,420,55,PAPER,COPPER,'8 6' if ghost else ''),text(x,430,lab,30,COPPER,600,anchor='middle')]
    for dx,dy in [(-42,35),(42,35),(0,-47)]:
        p += [circle(x+dx,420+dy,6,TEAL,TEAL)]
    p += [rect(x-80,490,160,18,'#d9e4d8',TEAL),text(x,551,'same carrier',19,TEAL,anchor='middle')]
p += [line(480,420,825,420,TEAL,'10 8',True),text(650,390,'translate between records',20,TEAL,anchor='middle')]
# Co-moving optical heads (ghost means alternative, not simultaneous)
for x,ghost in [(390,False),(920,True)]:
    p += [rect(x-65,190,130,52,PAPER if ghost else '#d9e4d8',TEAL),text(x,224,'LDV',21,TEAL,600,anchor='middle'),line(x,242,x,357,COPPER,'6 5' if ghost else '',False,2)]
p += [text(650,185,'Co-moving LDV + fixture',21,TEAL,600,anchor='middle'),text(650,215,'same beam spot, angle and range',20,MUTED,anchor='middle'),line(460,255,850,255,TEAL,'7 7',True)]
# fixed head control, optically aimed at A at this instant
p += [rect(25,376,120,60,'#e8e4d9',INK),text(85,401,'Fixed LDV',19,INK,600,anchor='middle'),text(85,425,'control',17,MUTED,anchor='middle'),line(145,406,328,406,COPPER),text(26,477,'Re-aim at B;',18,MUTED),text(26,503,'log geometry.',18,MUTED)]
p += [line(510,460,449,443,COPPER,arrow=True),text(515,469,'F(t)',20,COPPER,600)]
# reference accelerometer and thermometry
p += [rect(650,465,45,30,TEAL,TEAL),text(710,485,'table a(t)',20,TEAL),line(672,495,672,530,TEAL)]
p += [text(1140,345,'T',28,COPPER,600),line(1150,360,1150,450,COPPER),circle(1150,465,13,PALE,COPPER),text(1110,512,'Temperature',18,MUTED),text(1110,538,'before / after',18,MUTED)]
# bottom instrument chain
p += [line(44,640,1236,640,LINE),text(44,681,'ACQUISITION CHAIN',18,TEAL,600,cls='mono')]
p += [rect(44,710,345,130),lines(64,744,['Calibrated excitation F(t)','Measure the delivered input.','Verify energy in the test band.'],21,gap=32)]
p += [rect(445,710,345,130),lines(465,744,['Synchronous DAQ + clock','Acquire F(t), v(t), table a(t).','Log T, geometry and settings.'],21,gap=32)]
p += [rect(846,710,390,130),lines(866,744,['Frequency response + fits','Compare matched modal poles.','Keep amplitude, phase and errors.'],21,gap=32)]
p += [line(393,775,438,775,TEAL,arrow=True),line(794,775,839,775,TEAL,arrow=True)]
p += [text(44,889,'Separate runs: portable support / direct table contact / fixed-head control. Never combine their data as one boundary condition.',19,MUTED),text(44,920,'LDV measures velocity along its beam. Soft support reduces coupling; it does not create a free or frictionless sphere.',19,MUTED)]
doc('setup.svg','Copper-sphere A/B measurement bench','A proposed two-metre table with sequential specimen stations A and B. One hollow sphere and the same three-point carrier move between stations. A co-moving laser Doppler vibrometer preserves beam geometry; a fixed head is a separate control. Calibrated excitation, a table accelerometer, temperature records and a shared-clock data acquisition system support comparison of fitted modes. The table and support are never assumed frictionless.',946,p)
# CONFOUNDS
p=[]
p += [text(44,42,'02 / WHAT A SPECTRUM CONTAINS',18,TEAL,600,cls='mono'),text(44,86,'A shifted peak has more than one explanation.',35,INK,600),text(44,121,'The detector records a channel of a coupled system, within a finite bandwidth.',21,MUTED)]
# layered rows (not misleading one serial physical chain)
rows=[
('01','SPECIMEN','Material · shape · temperature · stress','Same sphere, orientation and thermal history',COPPER),
('02','BOUNDARY','Support · contact force · table modes','Carry the same support; test bare contact separately',TEAL),
('03','PATH','Air · room reflections · external fields','Co-move geometry; record environment and reference',TEAL),
('04','RECEIVER','Beam direction · gain · clock · noise','Calibrate; repeat with fixed and co-moving sensors',TEAL),
('05','INFERENCE','Input spectrum · window · fit · mode label','Compare fitted poles with uncertainty, not tallest bins',INK)]
for i,(n,label,things,control,c) in enumerate(rows):
    y=158+i*107
    p += [rect(44,y,1192,88,PAPER,LINE),text(63,y+34,n,20,c,600,cls='mono'),text(112,y+34,label,20,c,600,cls='mono'),text(112,y+64,things,21,INK),text(675,y+35,'CONTROL',16,c,600,cls='mono'),text(675,y+65,control,20,MUTED)]
    if i<4:p += [line(640,y+89,640,y+104,TEAL,arrow=True)]
p += [rect(44,718,1192,154,'#e8eee3',TEAL),text(65,752,'READOUT MODEL',17,TEAL,600,cls='mono'),text(65,790,'measured response = receiver × coupled dynamics × excitation + noise',27,INK,500),text(65,828,'A microphone adds room propagation. An LDV measures a surface velocity projection.',21,MUTED),text(65,856,'There is no instrument channel called the “entire frequency” of an object or a point.',21,MUTED)]
doc('confounds.svg','Why measured spectra can vary with position','Five analysis layers: specimen properties, support and table boundary conditions, environmental path, receiver geometry and calibration, and spectral inference. Each layer has a corresponding control. The schematic explains why a changed recorded peak does not uniquely imply a changed intrinsic mode or an absolute location frequency.',900,p)
# MOTION CONTROLS
p=[]
p += [text(44,42,'03 / A SEPARATE MOTION TEST',18,TEAL,600,cls='mono'),text(44,86,'Does a driven sphere move toward a chosen station?',34,INK,600),text(44,121,'Proposed test only. A vibration-frequency match does not specify a force or a destination.',21,MUTED)]
p += [rect(80,260,1120,210,'#eceee5',TEAL),text(103,298,'TOP VIEW / MARKED TRACK',19,TEAL,600,cls='mono')]
p += [circle(300,370,44,PALE,COPPER),text(300,379,'A',26,COPPER,600,anchor='middle'),circle(980,370,44,PAPER,TEAL,'6 6'),text(980,379,'B',26,TEAL,600,anchor='middle'),line(380,370,890,370,TEAL,'8 7',True),text(640,340,'Track x(t), velocity, drift and stopping position',20,TEAL,anchor='middle')]
p += [rect(545,160,190,62,PAPER,TEAL),text(640,185,'OVERHEAD CAMERA',18,TEAL,600,anchor='middle'),text(640,209,'calibrated scale + clock',16,MUTED,anchor='middle'),line(640,222,640,260,TEAL,'4 5')]
p += [rect(25,332,90,78,PAPER,INK),text(70,359,'drive',19,INK,600,anchor='middle'),text(70,386,'source',19,INK,600,anchor='middle'),line(118,370,250,370,COPPER,'5 6',True)]
p += [text(80,507,'Check level with a calibrated inclinometer; use an airflow enclosure and log source direction.',21,MUTED)]
cards=[(44,'SHAM + DETUNED','Randomize drive off / target /','detuned at matched input level.'),(451,'REVERSE THE APPARATUS','Reverse source direction and','rotate the table relative to room.'),(858,'BLIND THE DESTINATION','Predefine A/B target labels.','Judge tracked motion blind.')]
for x,t,a,b in cards:
    p += [rect(x,552,378,132),text(x+18,584,t,17,TEAL,600,cls='mono'),text(x+18,622,a,21,INK),text(x+18,652,b,21,INK)]
p += [text(44,730,'Ordinary alternatives: residual slope, airflow, acoustic force, contact vibration, electromagnetic force and handling.',20,MUTED),text(44,764,'Keep this test separate from modal measurements. No motion result has been collected for this project.',20,MUTED)]
doc('movementtest.svg','Independent controlled motion experiment','A proposed top-view table with a copper sphere at A and target B. An overhead camera records position versus time. The drive direction, level and airflow are controlled. Randomized sham, target-frequency and detuned conditions, apparatus reversal and blinded destination labels help distinguish ordinary forces and drift from a claimed destination-specific effect. This is not a depiction of an observed result.',796,p)
print('Wrote 3 accessible SVG diagrams')
