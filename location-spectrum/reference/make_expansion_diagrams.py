"""Generate original, deterministic measurement schematics; no measured data.
Run from any directory: python reference/make_expansion_diagrams.py
The generated SVGs are written beside the app's other scientific diagrams.
"""
from pathlib import Path
from html import escape
from math import exp
OUT = Path(__file__).resolve().parents[1] / 'public' / 'diagrams'
PAPER='#faf8f2'; INK='#202d2b'; MUTED='#57615a'; LINE='#d2d5ca'; TEAL='#245c50'; COPPER='#a64d2d'; PALE='#f0e0d4'
def text(x,y,s,size=22,color=INK,weight=400,anchor='start',mono=False):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}"'+(' class="mono"' if mono else '')+'>'+escape(s)+'</text>'
def lines(x,y,ss,size=22,color=INK,gap=30,weight=400):
    return ''.join(text(x,y+i*gap,s,size,color,weight) for i,s in enumerate(ss))
def rect(x,y,w,h,fill=PAPER,stroke=LINE):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def line(x1,y1,x2,y2,color=TEAL,dash='',arrow=False,width=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def path(d,color=TEAL,dash='',arrow=False,width=2,fill='none'):
    return f'<path d="{d}" stroke="{color}" fill="{fill}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def circle(x,y,r,fill=PALE,stroke=COPPER,dash=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="3"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
def doc(name,title,desc,height,parts):
    OUT.mkdir(parents=True,exist_ok=True)
    content=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{TEAL}"/></marker></defs><style>text{{font-family:Arial,Helvetica,sans-serif}}.mono{{font-family:ui-monospace,monospace;letter-spacing:.6px}}</style><rect width="1280" height="{height}" fill="{PAPER}"/>'''+''.join(parts)+'</svg>'
    (OUT/name).write_text(content)
# ACQUISITION CHAIN: force and velocity remain separate until inference.
p=[text(44,42,'04 / SIGNALS, UNITS AND BANDWIDTH',18,TEAL,600,mono=True),text(44,86,'Measure the input and the response together.',35,INK,600),text(44,121,'Proposed acquisition architecture · arrows show mechanical or recorded-signal paths',21,MUTED)]
p += [rect(44,166,340,132),text(64,201,'SOURCE + FORCE REFERENCE',18,TEAL,600,mono=True),lines(64,239,['Delivered force F(t) [N]','Exciter + force sensor calibrated'],21,gap=30)]
p += [rect(470,166,340,132,PALE,COPPER),text(490,201,'LOADED COPPER SPHERE',18,COPPER,600,mono=True),lines(490,239,['Material, geometry, support','Surface motion v(t) [m/s]'],21,gap=30)]
p += [rect(896,166,340,132),text(916,201,'VELOCITY LDV',18,TEAL,600,mono=True),lines(916,239,['One beam projection of v(t)','Calibrated voltage Vᵥ(t) [V]'],21,gap=30)]
p += [line(390,230,464,230,TEAL,arrow=True),text(427,212,'force',17,MUTED,anchor='middle'),line(816,230,890,230,TEAL,arrow=True),text(853,212,'optical',17,MUTED,anchor='middle')]
p += [line(214,300,214,367,TEAL,arrow=True),text(230,338,'Vꜰ(t) [V]',19,TEAL),line(1066,300,1066,367,TEAL,arrow=True),text(1083,338,'Vᵥ(t) [V]',19,TEAL)]
p += [rect(44,374,340,143),text(64,410,'FORCE CHANNEL',18,TEAL,600,mono=True),lines(64,447,['Analog anti-alias filter','Known gain, delay and bandwidth'],21,gap=32)]
p += [rect(896,374,340,143),text(916,410,'VELOCITY CHANNEL',18,TEAL,600,mono=True),lines(916,447,['Analog anti-alias filter','Known gain, delay and bandwidth'],21,gap=32)]
p += [text(640,400,'Metadata + reference channels',21,INK,600,anchor='middle'),text(640,435,'T [K] · position [m] · support',20,MUTED,anchor='middle'),text(640,467,'Table a(t) [m/s²] via its calibrated channel',18,MUTED,anchor='middle'),path('M 640 488 V 555',TEAL,'5 6',True)]
p += [path('M 214 519 V 630 H 420',TEAL,arrow=True),path('M 1066 519 V 630 H 860',TEAL,arrow=True)]
p += [rect(427,566,426,170,'#e8eee3',TEAL),text(449,603,'SYNCHRONOUS ADC / SHARED CLOCK',18,TEAL,600,mono=True),lines(449,641,['fₛ [samples/s] · N samples per record','Digitize both voltages on the same clock','Trecord = N/fₛ  ·  Δfbin = fₛ/N'],21,gap=32)]
p += [path('M 640 738 V 775 H 339 V 809',TEAL,arrow=True)]
p += [rect(44,816,590,160),text(64,853,'CALIBRATION → WINDOW → FFT / FRF',18,TEAL,600,mono=True),lines(64,891,['Convert to F[n] [N] and v[n] [m/s]','Complex mobility Hᵥꜰ(f): (m/s)/N','Keep phase, input spectrum and coherence γ²'],21,gap=31)]
p += [rect(706,816,530,160),text(726,853,'MODE FIT + UNCERTAINTY',18,TEAL,600,mono=True),lines(726,891,['fₙ [Hz] · damping ratio ζ [1]','Fit common poles across repeated channels','Account for noise, clock, fit and model error'],21,gap=31)]
p += [line(641,896,699,896,TEAL,arrow=True)]
p += [text(44,1024,'Retained band B must lie below fₛ/2 with an anti-alias transition margin. Sensors and excitation may limit B further.',20,MUTED),text(44,1058,'FFT bin spacing is not frequency uncertainty. Zero-padding adds display points, not new measured information.',20,MUTED)]
doc('acquisition-chain.svg','Force-referenced vibration measurement chain','A calibrated source applies measured force to a loaded copper sphere. A laser Doppler vibrometer measures one surface-velocity projection. Separate force-reference and velocity voltages pass through calibrated analog anti-alias filters and enter a shared-clock synchronous analog-to-digital converter. Sample rate and record length define bin spacing. Calibrations, windows and Fourier or cross-spectral analysis produce a complex mobility in metres per second per newton. Repeated-channel pole fits report frequency, damping and uncertainty. Temperature, position, support and a calibrated table-acceleration channel are recorded separately. Usable sensor, source and filter bandwidth and the Nyquist limit must all be respected.',1090,p)
# MODE VISIBILITY: one sphere, several source/readout combinations.
p=[text(44,42,'05 / MODE VISIBILITY AND MATCHING',18,TEAL,600,mono=True),text(44,86,'A missing peak can be a hidden measurement angle.',34,INK,600),text(44,121,'Proposed scan sequence · schematic curves show possibilities, not measured or fitted results',21,MUTED)]
p += [text(44,171,'1  KEEP STATION A FIXED',19,TEAL,600,mono=True),text(44,201,'Scan ≥3 readout spots; excite sequentially at E1, then E2.',21,MUTED)]
p += [circle(370,374,97,PALE,COPPER),circle(370,374,89,PAPER,COPPER),text(370,384,'A',34,COPPER,600,anchor='middle')]
# Readout arrangements, one scanning instrument possible.
p += [rect(75,246,150,63),text(150,275,'S1 · LDV',20,TEAL,600,anchor='middle'),text(150,298,'readout',17,MUTED,anchor='middle'),line(225,290,293,313,COPPER)]
p += [rect(558,256,150,63),text(633,285,'S2 · LDV',20,TEAL,600,anchor='middle'),text(633,308,'readout',17,MUTED,anchor='middle'),line(558,305,452,321,COPPER)]
p += [rect(286,537,170,63),text(371,566,'S3 · LDV',20,TEAL,600,anchor='middle'),text(371,589,'readout',17,MUTED,anchor='middle'),line(371,537,371,471,COPPER)]
# Two force-input locations with explicit separate sequence.
p += [circle(307,447,7,TEAL,TEAL),circle(416,289,7,TEAL,TEAL),line(219,482,301,451,TEAL,arrow=True),text(100,489,'E1 · input',20,TEAL,600),line(478,223,422,282,TEAL,arrow=True),text(489,232,'E2 · input',20,TEAL,600)]
p += [text(44,644,'Hold support, temperature and specimen orientation fixed.',21,MUTED),text(44,674,'Return to the first geometry to check drift.',21,MUTED)]
# Illustrative readout spectra in a distinct panel with no numerical axes.
p += [rect(768,163,468,529,'#edf0e7',LINE),text(791,202,'DIFFERENT MODAL AMPLITUDES',17,TEAL,600,mono=True),text(791,234,'One candidate set of poles',21,INK),text(791,265,'can appear differently in each channel.',19,MUTED)]
for x in [940,1100]:p += [line(x,301,x,590,TEAL,'4 7',False,1.5)]
for idx,(a,b) in enumerate([(61,48),(7,63),(62,12)]):
    base=370+idx*105
    pts=[]
    for x in range(830,1201,2):
        # Two hand-designed Gaussian features illustrate visibility only.
        y=base-a*exp(-((x-940)/18)**2)-b*exp(-((x-1100)/22)**2)
        pts.append((x,y))
    d='M '+' L '.join(f'{x},{y:.2f}' for x,y in pts)
    p += [text(791,base-12,f'S{idx+1}',20,TEAL,600),line(827,base+8,1204,base+8,LINE),path(d,COPPER,width=3)]
p += [text(1000,634,'frequency →  (schematic)',19,MUTED,anchor='middle'),text(791,668,'Amplitude is channel-dependent.',18,MUTED)]
# Distinct next controls, not a simultaneous state change.
p += [rect(44,729,574,188),text(66,769,'2  ROTATE WITHOUT TRANSLATING',18,TEAL,600,mono=True),lines(66,809,['Keep station A; rotate the marked sphere.','Repeat handling without rotation as a control.','Check split modes, seams and anisotropy.','A changed amplitude need not be a shifted pole.'],21,gap=29)]
p += [rect(662,729,574,188),text(684,769,'3  TRANSLATE WITH MATCHED GEOMETRY',18,TEAL,600,mono=True),lines(684,809,['Move A → B with the same portable support.','Preserve source and readout spots and angles.','Randomize order; log thermal and clock drift.','Compare the same mode family with uncertainty.'],21,gap=29)]
p += [rect(44,947,1192,108,'#e8eee3',TEAL),text(66,984,'JOINT INFERENCE',17,TEAL,600,mono=True),text(66,1020,'Fit complex responses together. Three readouts improve observability; they do not establish modal completeness.',21,INK)]
doc('visibility-scan.svg','Mode visibility scan followed by orientation and translation controls','At fixed station A, at least three readout locations S1, S2 and S3 measure a copper sphere, potentially using one scanning vibrometer sequentially. Two controlled excitation locations E1 and E2 are used in separate records. Schematic response curves illustrate different modal amplitudes at the same candidate poles and are not measured data. The next control rotates the specimen without translating it and includes handling-only repeats. A separate A-to-B test preserves portable support and relative source and sensor geometry. Complex responses are fit jointly with uncertainty; three readouts do not guarantee observation of all modes.',1086,p)
print('Generated acquisition-chain.svg and visibility-scan.svg')
