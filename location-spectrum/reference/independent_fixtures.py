"""Independent Python/SciPy checks, derived before reading the browser model.
Run: python independent_fixtures.py
Parameters are illustrative unless explicitly labeled literature reference.
No physical measurements are represented by these outputs.
"""
from pathlib import Path
import json
import numpy as np
from scipy.optimize import brentq
from scipy.special import spherical_jn, spherical_yn
from scipy.linalg import eigh

OUT = Path(__file__).parent

def velocities(E, nu, rho):
    return (E*(1-nu)/(rho*(1+nu)*(1-2*nu)))**.5, (E/(2*rho*(1+nu)))**.5

def solid(E, nu, rho, R):
    cl, ct = velocities(E, nu, rho)
    ratio = (ct/cl)**2
    residual = lambda x: x*spherical_jn(0,x)-4*ratio*spherical_jn(1,x)
    grid=np.linspace(.01, 20, 10001)
    roots=[]
    for a,b in zip(grid[:-1],grid[1:]):
        if residual(a)*residual(b)<0:
            roots.append(brentq(residual,a,b,xtol=1e-14))
    root=roots[0]
    # Independent equivalent boundary condition, using analytic sine and cosine.
    stress=(root*root-4*ratio)*np.sin(root)+4*ratio*root*np.cos(root)
    return dict(E_Pa=E,nu=nu,rho_kg_m3=rho,radius_m=R,cL_m_s=cl,cT_m_s=ct,
                roots=roots[:4],frequencies_Hz=[x*cl/(2*np.pi*R) for x in roots[:4]],
                first_root_stress_residual=float(stress),mass_kg=4*np.pi*R**3*rho/3)

def shell(E, nu, rho, R, t):
    cl,ct=velocities(E,nu,rho)
    ratio=(ct/cl)**2
    fthin=(2*E/(rho*(1-nu)))**.5/(2*np.pi*R)
    athin=fthin*2*np.pi*R/cl
    inner=1-t/(2*R); outer=1+t/(2*R)
    def stress_j(x):return spherical_jn(0,x)-4*ratio*spherical_jn(1,x)/x
    def stress_y(x):return spherical_yn(0,x)-4*ratio*spherical_yn(1,x)/x
    def det(x):
        return stress_j(x*inner)*stress_y(x*outer)-stress_y(x*inner)*stress_j(x*outer)
    x=brentq(det,.7*athin,1.3*athin,xtol=1e-13)
    exact=x*cl/(2*np.pi*R)
    # Symmetric shell geometry: radius here is mid-surface radius.
    mass=4*np.pi*rho*((R+t/2)**3-(R-t/2)**3)/3
    approx=4*np.pi*rho*R*R*t
    return dict(mid_radius_m=R,thickness_m=t,thickness_ratio=t/R,
                thin_breathing_Hz=fthin,elastic_shell_breathing_Hz=exact,
                relative_thin_frequency_error=fthin/exact-1,
                mass_exact_kg=mass,mass_membrane_kg=approx,
                relative_mass_underestimate=1-approx/mass,
                exact_root=x,determinant_residual=det(x))

def coupled(phi, fs=22000, ft=21800, ms=.1, mt=1., kc=1e8, zs=.002, zt=.01):
    """Physical spring energy: 1/2 kc (u_s - phi u_t)^2.
    Effective modal masses and table shape are selected illustration parameters.
    """
    ws=2*np.pi*fs;wt=2*np.pi*ft
    M=np.diag([ms,mt])
    K=np.array([[ms*ws**2+kc,-kc*phi],[-kc*phi,mt*wt**2+kc*phi**2]])
    C=np.diag([2*zs*ms*ws,2*zt*mt*wt])
    vals, vecs=eigh(K,M)
    eigen=np.sqrt(vals)/(2*np.pi)
    frf=[]
    for f in [21000.,22000.,23000.]:
        w=2*np.pi*f
        Z=K-w*w*M+1j*w*C
        response=np.linalg.solve(Z,np.array([1.,0.]))
        velocity=1j*w*response
        # Force phasors use peak amplitudes; averages carry 1/2.
        power_in=.5*np.real(np.vdot(np.array([1.,0.]),velocity))
        power_loss=.5*np.real(np.vdot(velocity,C@velocity))
        assert np.isclose(power_in,power_loss,rtol=1e-12,atol=1e-20)
        assert power_in >= 0
        frf.append(dict(frequency_Hz=f,sphere_compliance_m_N=dict(real=response[0].real,imag=response[0].imag),
                        table_compliance_m_N=dict(real=response[1].real,imag=response[1].imag),
                        input_power_W=power_in,dissipated_power_W=power_loss))
    return dict(phi=phi,M=M.tolist(),K=K.tolist(),C=C.tolist(),eigenfrequencies_Hz=eigen.tolist(),frf=frf)

def empty_table(position, ft=21800., mt=1.4, zeta=.01):
    """Independent one-DOF matrix solve with point force/readout projections."""
    phi=0. if position in (0.,1.) else np.sin(np.pi*position)
    wt=2*np.pi*ft
    output=[]
    for f in [0., .8*ft, ft, 1.2*ft]:
        w=2*np.pi*f
        # Local unit force enters modal equation as phi; local readout is phi*q.
        Z=np.array([[mt*wt**2-mt*w*w+1j*w*2*zeta*mt*wt]])
        q=np.linalg.solve(Z,np.array([phi]))[0]
        h=phi*q
        output.append(dict(frequency_Hz=f,real=float(h.real),imag=float(h.imag),magnitude=float(abs(h))))
    return dict(position=position,phi=float(phi),table_frequency_Hz=ft,modal_mass_kg=mt,damping_ratio=zeta,values=output)

E=110e9;nu=.34;rho=8960.
reference=solid(E,nu,rho,.01)
assert abs(reference['first_root_stress_residual'])<1e-11
assert np.allclose(np.array(solid(E,nu,rho,.02)['frequencies_Hz'])*2,reference['frequencies_Hz'])
assert np.allclose(np.array(solid(4*E,nu,rho,.01)['frequencies_Hz'])/2,reference['frequencies_Hz'])
# Mass conservation expansion test, nu held fixed.
alpha=16.5e-6;beta=-4.8e-4;dT=.1
scale=1+alpha*dT
actual=solid(E*(1+beta*dT),nu,rho/scale**3,.01*scale)['frequencies_Hz'][0]
ratio=(1+beta*dT)**.5*scale**.5
assert np.isclose(actual/reference['frequencies_Hz'][0],ratio,rtol=1e-12)

out=dict(
    provenance=dict(method='Independent Python/SciPy derivation and execution',measured=False,
                    source_model_read_before_derivation=False,
                    input_note='E=110GPa, nu=.34, rho=8960kg/m3 illustrative; separate NIST-reference case included'),
    solid_20mm=reference,
    solid_20mm_NIST_reference=solid(123.5e9,.35,8960.,.01),
    shells_illustrative=[shell(E,nu,rho,d*.0254/2,.0005) for d in [3,3.5,4]],
    shells_NIST_reference=[shell(123.5e9,.35,rho,d*.0254/2,.0005) for d in [3,3.5,4]],
    shell_thickness_scan=[shell(E,nu,rho,.04445,.04445*r) for r in [.001,.005,.01,.02,.05]],
    coupled_A=coupled(.1),coupled_B=coupled(1.),
    empty_table=[empty_table(x) for x in [0.,.1,.25,.5,.75,1.]],
    thermal=dict(alpha_per_K=alpha,beta_E_per_K=beta,delta_T_K=dT,
                 nu_fixed=True,mass_conserved=True,fractional_shift=ratio-1,
                 first_mode_shift_Hz=actual-reference['frequencies_Hz'][0],
                 derivative_per_K=.5*(alpha+beta)),
    redshift=dict(delta_height_m=.001,g_m_s2=9.80665,c_m_s=299792458.,
                  fractional_shift=9.80665*.001/299792458.**2,
                  shift_at_22000_Hz=22000*9.80665*.001/299792458.**2))
(OUT/'independent-fixtures.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:out[k] for k in ['solid_20mm','shells_illustrative','thermal','redshift']},indent=2))
print('PASS: independent roots, radius scaling, stiffness scaling, mass-conserving temperature identity, passive FRF power balance.')
