import { createCanvas } from '@napi-rs/canvas';
import { drawGuardian } from '../src/art/guardian.js';
import { drawReefBackdrop, drawReefForeground } from '../src/engine/scene.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleAnimation } from '../src/engine/rig.js';

const W=320,H=360;
const cv=createCanvas(W,H); const ctx=cv.getContext('2d',{willReadFrequently:true});
const pipe=new PixelPipeline();
const rigs=[]; for(let i=0;i<30;i++) rigs.push(sampleAnimation('roar', i/30*3));

const bench=(name,fn,n=40)=>{ for(let i=0;i<5;i++) fn(i); const t0=performance.now(); for(let i=0;i<n;i++) fn(i); const dt=(performance.now()-t0)/n; console.log(name, dt.toFixed(2),'ms'); };

bench('character only', (i)=>{ ctx.clearRect(0,0,W,H); drawGuardian(ctx, rigs[i%30], i*0.016); });
bench('char + world  ', (i)=>{ ctx.clearRect(0,0,W,H); drawReefBackdrop(ctx, i*0.05); drawGuardian(ctx, rigs[i%30], i*0.016); drawReefForeground(ctx, i*0.05); });
bench('quantize      ', (i)=>{ pipe.quantize(ctx,W,H,{dither:7}); });
bench('FULL FRAME    ', (i)=>{ ctx.clearRect(0,0,W,H); drawReefBackdrop(ctx, i*0.05); drawGuardian(ctx, rigs[i%30], i*0.016); drawReefForeground(ctx, i*0.05); pipe.quantize(ctx,W,H,{dither:7}); });
