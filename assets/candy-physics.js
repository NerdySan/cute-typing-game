function createCandyGame(canvas, callbacks) {
  const {Engine, Bodies, Body, Composite, Query}=Matter;
  const ctx=canvas.getContext('2d');
  const colors=['#ff789e','#f5b73f','#57cfa2','#68aef1','#b58ae9'];
  const step=1000/120;
  let engine, pieces=[], effects=[], queue=[], score=0, frame=null, last=0, accumulator=0;
  let spawnWait=0, blockedFor=0, reduced=false, active=false, width=0, height=0, walls=[], observer=null;
  let matchCount=3;

  function hint() {
    return '打字母或數字讓糖果落下！'+matchCount+' 顆以上同色碰在一起就會消除。';
  }

  function makeGlyph(char, color) {
    const image=document.createElement('canvas');
    image.width=56;image.height=64;
    const g=image.getContext('2d');
    g.font='900 48px Arial, sans-serif';
    g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    g.strokeStyle='#fff5e7';g.lineWidth=4;g.strokeText(char,28,33);
    g.fillStyle=colors[color];g.fillText(char,28,33);
    const pixels=g.getImageData(0,0,56,64).data, parts=[];
    for(let y=0;y<64;y+=4){
      let start=-1;
      for(let x=0;x<=56;x+=4){
        const filled=x<56&&pixels[((y+2)*56+x+2)*4+3]>64;
        if(filled&&start<0)start=x;
        if(!filled&&start>=0){
          parts.push(Bodies.rectangle(width/2+(start+x)/2-28,50+y+2-32,x-start,4));
          start=-1;
        }
      }
    }
    if(!parts.length)throw new Error('無法繪製糖果字元：'+char);
    const body=Body.create({parts,friction:.25,frictionStatic:.5,restitution:.12,frictionAir:.012});
    const offset={x:width/2-body.position.x,y:50-body.position.y};
    Body.setAngle(body,(Math.random()-.5)*.4);
    return {body,image,offset,color};
  }

  function touchingGroups() {
    const byId=new Map(pieces.map(piece=>[piece.body.id,piece]));
    const neighbors=new Map(pieces.map(piece=>[piece.body.id,new Set()]));
    for(const pair of engine.pairs.list){
      if(!pair.isActive)continue;
      const a=byId.get(pair.collision.bodyA.parent.id),b=byId.get(pair.collision.bodyB.parent.id);
      if(a&&b&&a!==b&&a.color===b.color){
        neighbors.get(a.body.id).add(b.body.id);
        neighbors.get(b.body.id).add(a.body.id);
      }
    }
    const visited=new Set(),matches=[];
    for(const piece of pieces){
      if(visited.has(piece.body.id))continue;
      const group=[],pending=[piece.body.id];visited.add(piece.body.id);
      while(pending.length){
        const id=pending.pop();group.push(byId.get(id));
        for(const next of neighbors.get(id))if(!visited.has(next)){visited.add(next);pending.push(next)}
      }
      if(group.length>=matchCount)matches.push(...group);
    }
    return matches;
  }

  function advance() {
    for(const effect of effects)effect.age+=step;
    effects=effects.filter(effect=>effect.age<700);
    spawnWait=Math.max(0,spawnWait-step);
    if(queue.length&&spawnWait===0){
      const blocked=Query.region(pieces.map(piece=>piece.body),{min:{x:width/2-35,y:12},max:{x:width/2+35,y:92}});
      if(!blocked.length){
        const piece=makeGlyph(queue.shift(),Math.floor(Math.random()*colors.length));
        pieces.push(piece);Composite.add(engine.world,piece.body);
        spawnWait=180;blockedFor=0;
      }else if(blocked.every(body=>body.speed<.35&&Math.abs(body.angularVelocity)<.02)){
        blockedFor+=step;
        if(blockedFor>2000){
          queue=[];blockedFor=0;
          callbacks.status('畫面堆滿了！按「清除」再玩一次。');
        }
      }else blockedFor=0;
    }
    Engine.update(engine,step);
    const matches=touchingGroups();
    if(matches.length){
      const removed=new Set(matches);
      for(const piece of matches){
        if(!reduced)effects.push({
          x:piece.body.position.x,y:piece.body.position.y,angle:piece.body.angle,
          image:piece.image,offset:piece.offset,color:colors[piece.color],age:0
        });
        Composite.remove(engine.world,piece.body);
      }
      pieces=pieces.filter(piece=>!removed.has(piece));
      score+=matches.length;callbacks.score(score);
      callbacks.status('✨ 消除了 '+matches.length+' 顆同色糖果！');
      callbacks.match();
    }
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const piece of pieces){
      const body=piece.body;
      ctx.save();
      ctx.translate(body.position.x,body.position.y);ctx.rotate(body.angle);
      ctx.shadowColor='#704d7070';ctx.shadowBlur=3;ctx.shadowOffsetY=3;
      ctx.drawImage(piece.image,piece.offset.x-28,piece.offset.y-32);
      ctx.restore();
    }
    for(const effect of effects){
      const progress=effect.age/700,spread=1-Math.pow(1-progress,2);
      ctx.save();
      ctx.translate(effect.x,effect.y);
      ctx.globalAlpha=1-progress;
      ctx.strokeStyle=effect.color;ctx.lineWidth=3*(1-progress)+1;
      ctx.beginPath();ctx.arc(0,0,10+spread*32,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<8;i++){
        const angle=i*Math.PI/4,distance=12+spread*(38+(i%2)*14);
        const x=Math.cos(angle)*distance,y=Math.sin(angle)*distance;
        const size=(i%2?3:5)*(1-progress);
        ctx.fillStyle=i%2?'#fff5b4':effect.color;
        ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
      }
      if(progress<.45){
        ctx.rotate(effect.angle);
        const scale=1+progress;
        ctx.scale(scale,scale);ctx.globalAlpha=1-progress/.45;
        ctx.drawImage(effect.image,effect.offset.x-28,effect.offset.y-32);
      }
      ctx.restore();
    }
  }

  function tick(now) {
    if(!active)return;
    if(last)accumulator+=Math.min(now-last,50);
    last=now;
    while(accumulator>=step){advance();accumulator-=step}
    draw();frame=requestAnimationFrame(tick);
  }

  function resize() {
    if(!engine)return;
    const box=canvas.getBoundingClientRect(),nextWidth=box.width,nextHeight=box.height;
    if(!nextWidth||!nextHeight)return;
    const ratio=Math.min(window.devicePixelRatio||1,2);
    if(width===nextWidth&&height===nextHeight&&canvas.width===Math.round(width*ratio)&&canvas.height===Math.round(height*ratio))return;
    const dx=width?(nextWidth-width)/2:0,dy=height?nextHeight-height:0;
    for(const piece of pieces){
      const body=piece.body;
      let x=body.position.x+dx,y=body.position.y+dy;
      x+=Math.max(0,-(body.bounds.min.x+dx))-Math.max(0,body.bounds.max.x+dx-nextWidth);
      y+=Math.max(0,-(body.bounds.min.y+dy))-Math.max(0,body.bounds.max.y+dy-nextHeight);
      Body.setPosition(body,{x,y});
    }
    for(const effect of effects){effect.x+=dx;effect.y+=dy}
    width=nextWidth;height=nextHeight;
    Composite.remove(engine.world,walls);
    walls=[
      Bodies.rectangle(-25,height/2,50,height+100,{isStatic:true}),
      Bodies.rectangle(width+25,height/2,50,height+100,{isStatic:true}),
      Bodies.rectangle(width/2,height+25,width+100,50,{isStatic:true})
    ];
    Composite.add(engine.world,walls);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    draw();
  }

  function stop() {
    active=false;
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;queue=[];pieces=[];effects=[];
    if(observer)observer.disconnect();
    observer=null;walls=[];width=0;height=0;
    if(engine){Composite.clear(engine.world,false);Engine.clear(engine);engine=null}
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function start(playMotion=false) {
    stop();engine=Engine.create();engine.gravity.y=1.5;
    resize();observer=new ResizeObserver(resize);observer.observe(canvas);
    active=true;score=0;last=0;accumulator=0;spawnWait=0;blockedFor=0;
    reduced=!playMotion&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    callbacks.score(0);callbacks.status(hint());
    if(!reduced)frame=requestAnimationFrame(tick);
  }

  function push(char) {
    if(!active)return;
    if(queue.length>=100){callbacks.status('字母太多了，請等糖果落下後再打。');return}
    queue.push(char);
    if(reduced){
      for(let i=0;i<600;i++)advance();
      draw();
    }
  }

  function playMotion() {
    if(!active||!reduced)return;
    reduced=false;last=0;accumulator=0;
    frame=requestAnimationFrame(tick);
  }

  function shake() {
    if(!active)return;
    if(!pieces.length){
      callbacks.status('畫面上還沒有糖果，先打字母或數字吧！');
      return;
    }
    callbacks.status('🌀 搖一搖，讓糖果散開！');
    blockedFor=0;
    pieces.forEach((piece,i)=>{
      const body=piece.body,direction=i%2?1:-1;
      const x=Math.max(-6,Math.min(6,body.velocity.x+direction*(3+Math.random()*2)));
      const y=Math.max(-5,Math.min(body.velocity.y,-2-Math.random()*1.5));
      Body.setVelocity(body,{x,y});
      Body.setAngularVelocity(body,body.angularVelocity+direction*.03);
    });
    if(reduced){
      for(let i=0;i<600;i++)advance();
      draw();
    }
  }

  function setMatchCount(count) {
    if(!Number.isInteger(count)||count<2||count>10)throw new RangeError('消除數量必須是 2 到 10');
    matchCount=count;
    if(!active)return;
    callbacks.status(hint());
    if(reduced){
      for(let i=0;i<600;i++)advance();
      draw();
    }
  }

  return {start,stop,push,playMotion,setMatchCount,shake};
}
