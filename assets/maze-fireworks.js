const mazeFireworks=(()=>{
  const canvas=document.getElementById('mazeFireworksCanvas'),ctx=canvas.getContext('2d');
  const colors=['#f14983','#f29b1f','#05ab9c','#4f83e5','#b854cf'];
  let frame=null,active=false,animated=false,last=0,untilLaunch=0,rockets=[],sparks=[];
  let width=0,height=0,ratio=0;
  function resize(){
    const w=window.innerWidth,h=window.innerHeight,d=Math.min(window.devicePixelRatio||1,2);
    if(w===width&&h===height&&d===ratio)return;
    width=w;height=h;ratio=d;
    canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);
    ctx.setTransform(d,0,0,d,0,0);
  }
  function clear(){ctx.clearRect(0,0,width,height)}
  function launch(){
    const x=width*(.08+Math.random()*.84);
    rockets.push({x,y:height,from:height,to:height*(.1+Math.random()*.6),age:0,duration:.65+Math.random()*.25,color:colors[Math.floor(Math.random()*colors.length)]});
  }
  function explode(rocket){
    const speed=Math.max(100,Math.min(width,height)*.28);
    for(let i=0;i<48;i++){
      const angle=Math.PI*2*i/48,velocity=speed*(.6+Math.random()*.7),life=1.1+Math.random()*.7;
      sparks.push({x:rocket.x,y:rocket.y,vx:Math.cos(angle)*velocity,vy:Math.sin(angle)*velocity,life,total:life,color:rocket.color});
    }
  }
  function drawStatic(){
    resize();clear();
    const points=[[.14,.2],[.84,.22],[.17,.65],[.82,.62],[.35,.8],[.68,.78]];
    const radius=Math.max(24,Math.min(55,Math.min(width,height)*.08));
    points.forEach(([x,y],i)=>{
      ctx.fillStyle=colors[i%colors.length];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;
      for(let j=0;j<12;j++){
        const angle=Math.PI*2*j/12;
        ctx.beginPath();ctx.arc(width*x+Math.cos(angle)*radius,height*y+Math.sin(angle)*radius,3,0,Math.PI*2);ctx.fill();
      }
    });
    ctx.shadowBlur=0;
  }
  function tick(now){
    if(!active||!animated)return;
    resize();
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    untilLaunch-=dt;
    if(untilLaunch<=0){launch();untilLaunch=.35}
    clear();
    for(let i=rockets.length-1;i>=0;i--){
      const rocket=rockets[i];rocket.age+=dt;
      const t=Math.min(1,rocket.age/rocket.duration);
      rocket.y=rocket.from+(rocket.to-rocket.from)*(1-Math.pow(1-t,2));
      ctx.strokeStyle=rocket.color;ctx.lineWidth=4;ctx.lineCap='round';
      ctx.shadowColor=rocket.color;ctx.shadowBlur=10;
      ctx.beginPath();ctx.moveTo(rocket.x,rocket.y);ctx.lineTo(rocket.x,rocket.y+24);ctx.stroke();
      if(t===1){explode(rocket);rockets.splice(i,1)}
    }
    for(let i=sparks.length-1;i>=0;i--){
      const spark=sparks[i];
      spark.life-=dt;
      if(spark.life<=0){sparks.splice(i,1);continue}
      spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;
      const drag=Math.exp(-1.3*dt);
      spark.vx*=drag;spark.vy=spark.vy*drag+90*dt;
      ctx.globalAlpha=Math.min(1,spark.life/.45);
      ctx.strokeStyle=spark.color;ctx.lineWidth=3;ctx.shadowColor=spark.color;ctx.shadowBlur=6;
      ctx.beginPath();ctx.moveTo(spark.x-spark.vx*.045,spark.y-spark.vy*.045);ctx.lineTo(spark.x,spark.y);ctx.stroke();
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    frame=requestAnimationFrame(tick);
  }
  function stop(){
    active=false;animated=false;
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;rockets=[];sparks=[];clear();
  }
  function start(motion){
    stop();active=true;animated=motion;resize();
    if(!motion){drawStatic();return}
    last=0;untilLaunch=0;
    launch();launch();
    frame=requestAnimationFrame(tick);
  }
  window.addEventListener('resize',()=>{if(active&&!animated)drawStatic()});
  return {start,stop};
})();
