// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { createCanvasField } from '../canvasField';
import { DEFAULT_SPATIAL } from '../spatialState';

describe('GPU-independent projection', () => {
 it('scales actual drawn coordinates, switches 4D geometry, and stops drawing after disposal', () => {
  const canvas=document.createElement('canvas'),host=document.createElement('div');
  const moves:number[][]=[];
  const context={clearRect:vi.fn(),setTransform:vi.fn(),beginPath:vi.fn(),stroke:vi.fn(),fill:vi.fn(),arc:vi.fn(),moveTo:(x:number,y:number)=>moves.push([x,y]),lineTo:(x:number,y:number)=>moves.push([x,y]),strokeStyle:'',fillStyle:'',lineWidth:1};
  vi.spyOn(canvas,'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(host,'getBoundingClientRect').mockReturnValue(new DOMRect(0,0,600,400));
  const settings={...DEFAULT_SPATIAL,motion:false};
  const field=createCanvasField(canvas,host,settings)!;
  const radius=()=>Math.max(...moves.map(([x])=>Math.abs(x-300)));
  const initial=radius();expect(initial).toBeGreaterThan(50);
  moves.length=0;field.update({...settings,zoom:1.5});expect(radius()/initial).toBeCloseTo(1.5,6);
  moves.length=0;field.update({...settings,dimension:'4d',fourth:90});
  expect(moves.length).toBeGreaterThan(1000);expect(moves.flat().every(Number.isFinite)).toBe(true);
  expect(radius()).not.toBeCloseTo(initial,2);
  field.dispose();const drawn=context.stroke.mock.calls.length;field.update({...settings,zoom:.5});expect(context.stroke).toHaveBeenCalledTimes(drawn);
  vi.restoreAllMocks();
 });
});
