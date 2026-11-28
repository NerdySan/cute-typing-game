const mazeWall=document.createElement('canvas');
mazeWall.width=mazeWall.height=128;
{
  const c=mazeWall.getContext('2d');
  c.fillStyle='#edbdc7';c.fillRect(0,0,128,128);
  for(let row=0;row<4;row++){
    for(let col=-1;col<3;col++){
      const x=col*64+(row%2)*32,y=row*32;
      c.fillStyle=(row+col)%2?'#f4cbd0':'#f1c2ca';c.fillRect(x+2,y+2,60,28);
      c.fillStyle='#fff0e3';c.globalAlpha=.5;c.fillRect(x+5,y+4,54,2);
      c.fillStyle='#cf9aa9';c.globalAlpha=.45;c.fillRect(x+5,y+27,54,2);
      c.globalAlpha=1;
    }
  }
}
const mazeFloor=document.createElement('canvas');
mazeFloor.width=160;mazeFloor.height=80;
const mazeFloorCtx=mazeFloor.getContext('2d');
const mazeFloorPixels=mazeFloorCtx.createImageData(mazeFloor.width,mazeFloor.height);
function drawMaze(x,y,angle){
  const canvas=$('#mazeCanvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const sky=ctx.createLinearGradient(0,0,0,h/2);
  sky.addColorStop(0,'#a8c9ef');sky.addColorStop(1,'#e1d6f1');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h/2);
  const dx=Math.cos(angle),dy=Math.sin(angle);
  for(let row=0;row<mazeFloor.height;row++){
    const distance=mazeFloor.height/(2*row+1);
    for(let col=0;col<mazeFloor.width;col++){
      const camera=2*(col+.5)/mazeFloor.width-1;
      const fx=x+distance*(dx-dy*camera*.66),fy=y+distance*(dy+dx*camera*.66);
      const tile=(Math.floor(fx*2)+Math.floor(fy*2))%2===0;
      const fog=Math.min(.5,distance*.06),i=(row*mazeFloor.width+col)*4;
      const color=tile?[244,220,210]:[207,175,195];
      mazeFloorPixels.data[i]=color[0]*(1-fog)+194*fog;
      mazeFloorPixels.data[i+1]=color[1]*(1-fog)+178*fog;
      mazeFloorPixels.data[i+2]=color[2]*(1-fog)+198*fog;
      mazeFloorPixels.data[i+3]=255;
    }
  }
  mazeFloorCtx.putImageData(mazeFloorPixels,0,0);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(mazeFloor,0,h/2,w,h/2);
  ctx.imageSmoothingEnabled=true;
  for(let col=0;col<w;col+=2){
    const camera=2*col/w-1,rx=dx-dy*camera*.66,ry=dy+dx*camera*.66;
    let mx=Math.floor(x),my=Math.floor(y);
    const ddx=Math.abs(1/rx),ddy=Math.abs(1/ry);
    const sx=rx<0?-1:1,sy=ry<0?-1:1;
    let sideX=(rx<0?x-mx:mx+1-x)*ddx,sideY=(ry<0?y-my:my+1-y)*ddy,side=0;
    while(!mazeMap[my][mx]){
      if(sideX<sideY){sideX+=ddx;mx+=sx;side=0}
      else{sideY+=ddy;my+=sy;side=1}
    }
    const distance=Math.max(.01,side===0?sideX-ddx:sideY-ddy);
    const height=Math.min(h*3,h/distance),top=(h-height)/2;
    const hit=side?x+distance*rx:y+distance*ry;
    const textureX=Math.floor((hit-Math.floor(hit))*mazeWall.width);
    ctx.drawImage(mazeWall,textureX,0,1,mazeWall.height,col,top,2,height);
    ctx.fillStyle='rgba(87,58,100,'+Math.min(.6,distance*.07+(side?.1:0))+')';
    ctx.fillRect(col,top,2,height);
    ctx.fillStyle='#fff3d2';ctx.fillRect(col,top+height*.1,2,Math.max(1,height*.025));
    ctx.fillStyle='#c38b9f';ctx.fillRect(col,top+height*.87,2,Math.max(1,height*.035));
    ctx.fillStyle='#ffead8';ctx.fillRect(col,top+height*.9,2,Math.max(1,height*.015));
  }
}
