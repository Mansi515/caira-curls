/* Local, explainable Caira Curls recommendation rules. */
(function (root) {
  const THRESHOLDS = Object.freeze({ highHumidity: 70, dryAir: 40, highTemperatureC: 30 });
  const FREQUENCY_DAYS = Object.freeze({ 'Every day':1, '2–3 times a week':3, 'Once a week':7, 'Less than once a week':null });
  const RULES = [
    { id:'wave-volume', category:'STYLE', title:'Keep it light', action:'Try a light mousse or a small amount of your usual styler, then scrunch at the roots.', explanation:'Your 2A–2B pattern and volume or flatness signals point toward lift without extra layers.', hairTypes:['2A','2B'], concerns:['Flat / lacking volume','Build-up'], goals:['More volume'], checkIn:['😐 Flat'], weight:4, focus:'Lightweight volume' },
    { id:'curl-definition', category:'STYLE', title:'Support your shape', action:'Try an even layer of styling cream or gel and scrunch gently.', explanation:'Your curl pattern and definition goal make shape-supporting hold a useful place to start.', hairTypes:['2C','3A','3B','3C'], concerns:['Loses definition'], goals:['More definition'], weight:3, focus:'Definition' },
    { id:'moisture', category:'REFRESH', title:'Bring back softness', action:'Mist with water, then smooth a little leave-in through the driest areas.', explanation:'Your dryness signals or dry, warm air make a little targeted moisture a reasonable first try.', concerns:['Dryness'], goals:['More moisture'], checkIn:['💧 Dry'], weatherConditions:['dry','hot'], weight:4, focus:'Moisture' },
    { id:'frizz-hold', category:'STYLE', title:'Help your style last', action:'Try a little more hold with your usual gel or mousse; smooth over the outside and scrunch.', explanation:'Your frizz signals and humid or wet weather may make style-preserving hold more useful today.', concerns:['Frizz'], goals:['Less frizz'], checkIn:['☁️ Frizzy'], weatherConditions:['humid','wet'], weight:4, focus:'Frizz control + hold' },
    { id:'dry-frizz-combo', category:'CARE', title:'Balance moisture and hold', action:'Mist lightly, smooth a small amount of leave-in over dry areas, then add a little hold over the outside.', explanation:'You checked in with both dryness and frizz, so this pairs targeted moisture with light style support.', checkInAll:['💧 Dry','☁️ Frizzy'], concerns:['Dryness','Frizz'], weight:5, focus:'Moisture + frizz control' },
    { id:'volume-refresh', category:'REFRESH', title:'Refresh without weighing down', action:'Fluff at the roots and use a light mist or a small amount of mousse.', explanation:'Your volume goal or flat check-in favors a light refresh over adding several product layers.', concerns:['Flat / lacking volume'], goals:['More volume'], checkIn:['😐 Flat'], weight:4, focus:'Lightweight refresh' },
    { id:'tangle-gentle', category:'CARE', title:'Go gently with tangles', action:'Use wet hands or a little leave-in to loosen knots from the ends upward.', explanation:'You mentioned tangles, so gentle, section-by-section handling is a useful place to start.', concerns:['Tangles easily'], checkIn:['😣 Tangled'], weight:4, focus:'Gentle detangling' },
    { id:'breakage-gentle', category:'CARE', title:'Minimize handling', action:'Let curls settle while air-drying or diffuse on low; avoid repeated scrunching as they set.', explanation:'Your breakage concern makes less manipulation a sensible routine choice.', concerns:['Breakage'], goals:['Longer/stronger hair'], weight:3, focus:'Gentle handling' },
    { id:'scalp-gentle', category:'WASH', title:'Keep scalp care simple', action:'At your next wash, cleanse gently and notice how your scalp feels afterward.', explanation:'You noted a scalp concern, so a simple, gentle hair-care step avoids making medical assumptions.', concerns:['Scalp concerns'], goals:['Healthier scalp'], weight:2, focus:'Gentle scalp care' },
    { id:'simple-routine', category:'STYLE', title:'Keep the routine simple', action:'Use fewer layers today and see how your hair responds.', explanation:'A simpler routine supports easier wash days and may be helpful when build-up is a concern.', concerns:['Build-up'], goals:['Easier wash days'], weight:2, focus:'Simple routine' },
    { id:'day-two', category:'REFRESH', title:'Revive yesterday’s shape', action:'Mist hands with water, smooth over only the areas that need it, and scrunch once or twice.', explanation:'Your day-two goal and wash timing make a targeted refresh a useful option.', goals:['Better day-two hair'], weight:3, focus:'Day-two refresh' },
    { id:'fine-wave-baseline', category:'STYLE', title:'Start with a light touch', action:'Begin with a small amount of styler and add only if your hair asks for more.', explanation:'For 2A–2B waves, starting with less can help you discover what gives your hair shape without weighing it down.', hairTypes:['2A','2B'], weight:1, focus:'Lightweight styling' },
    { id:'curl-moisture-baseline', category:'CARE', title:'Keep softness in the routine', action:'Try a little water or leave-in before styling, especially on drier sections.', explanation:'For 3B–3C curls, moisture and gentle handling can be helpful starting points; adjust to what your hair likes.', hairTypes:['3B','3C'], weight:1, focus:'Moisture + gentle care' },
    { id:'hot-light', category:'REFRESH', title:'Keep layers light', action:'Use a light mist and avoid adding several rich product layers today.', explanation:'Warm weather makes a lighter routine a sensible starting point.', weatherConditions:['hot'], weight:2, focus:'Lightweight refresh' },
    { id:'defined-working', category:'STYLE', title:'Keep what is working', action:'Your curls feel defined today. Keep your current approach, refresh only where needed, and skip extra layers.', explanation:'Your current check-in says your hair feels defined or good, so there may be no need to change what is working.', checkIn:['✨ Defined','😊 Loving it'], weight:7, focus:'Keep what is working' }
  ];
  const CYCLE_ACTIONS = {
    WASH_DAY:[
      {category:'WASH',title:'Start with your usual wash',action:'Cleanse as you normally do, then condition in the way your hair likes.',explanation:'You selected wash day, or your chosen day count has reached your usual wash interval.'},
      {category:'STYLE',title:'Set up your shape',action:'Apply your preferred styler to wet hair, using a light touch and focusing where you want definition.',explanation:'Styling after washing gives your curls or waves a fresh starting point.'},
      {category:'DRY',title:'Let curls set gently',action:'Air-dry or diffuse on low and limit touching while your hair sets.',explanation:'Gentle drying helps you preserve the shape you just styled.'}
    ],
    FRESH:[{category:'PRESERVE',title:'Preserve your wash-day result',action:'Leave your curls relatively undisturbed; refresh only a spot that needs it and skip extra product.',explanation:'You are early in your wash cycle, so keeping what is already working is a simple option.'}],
    REFRESH:[{category:'REFRESH',title:'Try a targeted refresh',action:'Assess first, then mist with water and scrunch; add a small amount of styler only where needed.',explanation:'You are in the middle of your wash cycle, so a targeted refresh may be enough without redoing the full routine.'}],
    LATE_CYCLE:[{category:'WASH',title:'Check refresh versus wash',action:'Notice oiliness or product build-up. If your hair feels ready, consider your next wash; otherwise refresh lightly and avoid stacking layers.',explanation:'You are getting closer to your usual wash interval, so checking how your hair feels can help guide the choice.'}],
    LESS_FREQUENT:[{category:'PRESERVE',title:'Follow your less-frequent rhythm',action:'There is no automatic wash prompt. Keep your routine if it feels right, and refresh only if you want to.',explanation:'You told us your usual routine is less than once a week, so the app leaves the timing in your hands.'}]
  };
  function normaliseFrequency(value){
    if(Object.prototype.hasOwnProperty.call(FREQUENCY_DAYS,value))return FREQUENCY_DAYS[value];
    const match=String(value||'').match(/(?:every\s*)?(\d+(?:\.\d+)?)\s*days?/i);
    return match?Number(match[1]):null;
  }
  function getWashCycle(profile={}){
    const day=Math.max(0,Number(profile.daysSinceWash||0)),interval=normaliseFrequency(profile.frequency);
    let position;
    if(profile.frequency==='Less than once a week')position='LESS_FREQUENT';
    else if(interval==null)position=day===0?'WASH_DAY':day===1?'FRESH':day===2?'REFRESH':'LATE_CYCLE';
    else if(day===0||day>=interval)position='WASH_DAY';
    else if(day===1&&day/interval<.8)position='FRESH';
    else if(day/interval>=.8)position='LATE_CYCLE';
    else position='REFRESH';
    return {position,day,interval,progress:interval?Math.min(1,day/interval):null};
  }
  function evaluate(profile={},weather={},moods=[]){
    const p=profile,concerns=p.concerns||[],goals=p.goals||[],texture=p.texture||'',cycle=getWashCycle(p);
    const temperature=weather.temperature??weather.temp;
    const condition=String(weather.condition||'').toLowerCase();
    const signals={humid:weather.humidity!=null&&weather.humidity>THRESHOLDS.highHumidity,dry:weather.humidity!=null&&weather.humidity<THRESHOLDS.dryAir,hot:temperature!=null&&temperature>=THRESHOLDS.highTemperatureC,wetCondition:/rain|drizzle|thunderstorm|snow/.test(condition),precipitationLikely:weather.precipitationProbability!=null&&weather.precipitationProbability>=50};
    const matched=[];
    for(const rule of RULES){
      const matchedTypes=rule.hairTypes?.includes(texture),matchedConcerns=(rule.concerns||[]).filter(x=>concerns.includes(x)),matchedGoals=(rule.goals||[]).filter(x=>goals.includes(x)),matchedMoods=(rule.checkIn||[]).filter(x=>moods.includes(x));
      const checkInAllMet=!!rule.checkInAll&&rule.checkInAll.every(x=>moods.includes(x));
      if(rule.checkInAll&&!checkInAllMet)continue;
      const matchedWeather=(rule.weatherConditions||[]).filter(x=>x==='dry'&&signals.dry||x==='humid'&&signals.humid||x==='hot'&&signals.hot||x==='wet'&&(signals.wetCondition||signals.precipitationLikely));
      // Weather can adjust a profile/check-in based recommendation, but cannot
      // produce a standalone hair-care recommendation by itself.
      if(!matchedTypes&&!matchedConcerns.length&&!matchedGoals.length&&!matchedMoods.length&&!checkInAllMet)continue;
      const points=(matchedTypes?1:0)+matchedConcerns.length*1.5+matchedGoals.length*2+matchedMoods.length*4+(checkInAllMet?8:0)+matchedWeather.length*2;
      matched.push({...rule,score:points*rule.weight,checkInAllMet});
    }
    const checked=m=>moods.includes(m),selected=[],cycleCards=CYCLE_ACTIONS[cycle.position]||[];
    const lateCycleWashCue=cycle.position==='WASH_DAY'&&cycle.day>0&&(checked('🫧 Oily')||checked('☁️ Frizzy')||concerns.includes('Build-up'));
    if(lateCycleWashCue){
      selected.push({category:'WASH',title:'You may be approaching wash day',action:'Since you are feeling oiliness or frizz this late in your cycle, consider your next wash before layering more product. If you prefer, do a light refresh instead.',explanation:'Your wash timing and today’s check-in are pointing in the same direction.',focus:'Wash or refresh'});
    }else selected.push(...cycleCards);
    if(cycle.position==='FRESH'&&checked('☁️ Frizzy'))selected[0]={category:'PRESERVE',title:'Refresh lightly, don’t restart',action:'Try a very light water refresh and a little hold only where needed; keep the rest of your wash-day routine intact.',explanation:'You are early in your wash cycle and reported frizz, so a small adjustment may be enough.',focus:'Light refresh + definition'};
    if(cycle.position==='FRESH'&&checked('😐 Flat'))selected[0]={category:'REFRESH',title:'Bring back lift, lightly',action:'Fluff at the roots and try a small amount of mousse; avoid redoing the full routine or adding several layers.',explanation:'You are early in your wash cycle but checked in that your hair feels flat, so a light volume refresh fits both signals.',focus:'Lightweight volume refresh'};
    if(cycle.position==='LATE_CYCLE'&&checked('☁️ Frizzy')&&checked('🫧 Oily'))selected[0]={category:'WASH',title:'Check whether wash day is next',action:'Rather than layering more product, consider whether your hair is ready for its next wash. Your usual timing remains your guide.',explanation:'Your later-cycle timing and frizzy + oily check-in are both relevant today.',focus:'Wash-day check'};
    if(cycle.position==='REFRESH'&&checked('💧 Dry')&&checked('☁️ Frizzy'))selected[0]={category:'CARE',title:'Moisture with light hold',action:'Mist with water, add a little leave-in to dry areas, then use a small amount of hold over the outside.',explanation:'You are at refresh time and reported both dryness and frizz, so this combines targeted moisture with definition support.',focus:'Refresh + moisture + hold'};
    // Current observations carry more weight than profile aspirations; compatible states may coexist.
    matched.sort((a,b)=>b.score-a.score);
    for(const rule of matched){if(selected.length>=5)break;if(lateCycleWashCue&&!['tangle-gentle','breakage-gentle','scalp-gentle'].includes(rule.id))continue;if(selected.some(x=>x.category===rule.category))continue;selected.push({category:rule.category,title:rule.title,action:rule.action,explanation:rule.explanation,focus:rule.focus,score:rule.score});}
    if((checked('✨ Defined')||checked('😊 Loving it'))&&!checked('💧 Dry')&&!checked('☁️ Frizzy')&&!checked('😐 Flat')&&!checked('😣 Tangled')){
      // A positive current check-in takes precedence over profile-only prompts to add product.
      for(let i=selected.length-1;i>=0;i--)if(selected[i].title==='Bring back softness'||selected[i].title==='Balance moisture and hold')selected.splice(i,1);
    }
    if(!selected.length)selected.push({category:'REFRESH',title:'See what your hair needs',action:'Try a light water refresh or keep your routine as it is.',explanation:'There are no strong profile or weather signals today, so let your hair guide the next step.',focus:'A gentle refresh'});
    const why=[];
    if(texture&&texture!=='Not sure')why.push(`${texture} hair`);if(goals.length)why.push(`a goal of ${goals[0].toLowerCase()}`);
    const activeConcerns=concerns.filter(x=>x!=='None of these');if(activeConcerns.length)why.push(`the concern${activeConcerns.length>1?'s':''} ${activeConcerns.slice(0,2).join(' and ').toLowerCase()}`);
    if(cycle.interval)why.push(`day ${cycle.day} of your usual ${cycle.interval}-day wash rhythm`);
    if(signals.humid)why.push('high humidity today');else if(signals.dry)why.push('low humidity today');
    if(signals.wetCondition)why.push(`${weather.condition.toLowerCase()} conditions`);else if(signals.precipitationLikely)why.push('a chance of precipitation');
    if(moods.length)why.push(`today’s check-in (${moods.map(x=>x.replace(/^\S+\s/,'').toLowerCase()).join(' + ')})`);
    const focus=selected[0]?.focus||({WASH_DAY:'Wash-day routine',FRESH:'Preserve fresh curls',REFRESH:'Targeted refresh',LATE_CYCLE:'Refresh or wash check',LESS_FREQUENT:'Your usual rhythm'}[cycle.position]);
    return {focus,why:why.length?`We considered ${why.join(', ')}. Treat this as a starting point and see how your hair responds.`:'This is a gentle starting point based on your routine. See how your hair responds.',washCyclePosition:cycle.position,washCycle:cycle,weatherModifiers:signals,hairState:moods.slice(),items:selected.map(x=>({label:x.category,title:x.title,text:x.action,why:x.explanation}))};
  }
  function evaluateExperiment(profile={},weather={},experiment={},products=[]){
    const checkIns=experiment.checkIns||experiment.checkins||[];
    const observations=[...new Set([...(experiment.observations||[]),...(experiment.selectedObservations||[]),...(!checkIns.length?(experiment.baselineHairState||[]):[])])];
    const goals=experiment.experimentGoals||experiment.goals||[];
    const duration=Number(experiment.durationDays||experiment.duration||14);
    const day=Math.max(1,Number(experiment.currentDay||1));
    const personalized=evaluate({...profile,daysSinceWash:experiment.daysSinceWash??profile.daysSinceWash},weather,observations);
    const rankedProducts=products.map(product=>{
      const goalMatches=(product.relevantExperimentGoals||[]).filter(goal=>goals.includes(goal));
      const concernMatches=(product.relevantHairConcerns||[]).filter(concern=>(profile.concerns||[]).includes(concern));
      const durationMatches=(product.supportedDurations||[]).map(Number).includes(duration);
      const isProductUnderTest=product.id===(experiment.productId||experiment.product?.id);
      const score=goalMatches.length*5+concernMatches.length*3+(isProductUnderTest?2:0);
      const variant=product.durationVariants?.[duration]||null;
      const variantUrl=variant?.buyUrl&&variant.buyUrl!=='...'?variant.buyUrl:'';
      return {...product,score,goalMatches,concernMatches,durationMatches,durationVariant:variant,demoUrl:variantUrl||product.durationUrls?.[duration]||product.productUrl||''};
    }).filter(product=>product.score>0&&product.durationMatches).sort((a,b)=>b.score-a.score);
    return {personalized,experiment:{productId:experiment.productId||experiment.product?.id||null,product:experiment.product||null,goals:goals.slice(),observations:observations.slice(),baselineHairState:(experiment.baselineHairState||[]).slice(),durationDays:duration,currentDay:day,checkIns:checkIns.length,notes:(experiment.notes||[]).slice()},products:rankedProducts};
  }
  function getRecommendation({profile={},weather={},experiment={},products=[]}={}){
    return evaluateExperiment(profile,weather,experiment,products);
  }
  root.CairaRecommendations={THRESHOLDS,FREQUENCY_DAYS,RULES,CYCLE_ACTIONS,getWashCycle,evaluate,evaluateExperiment,getRecommendation};
})(window);
