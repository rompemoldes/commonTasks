function moros() {
  const kairos = new Date();
  let janus = kairos;

  console.log('1st log');
  console.log('kairos: ', kairos.toISOString());
  console.log('janus: ', janus.toISOString());
  janus = new Date(kairos.valueOf());

  console.log('2nd log');
  console.log('kairos: ', kairos.toISOString());
  console.log('janus: ', janus.toISOString());

  janus = new Date(kairos.getTime());

  console.log('3rd log');
  console.log('kairos: ', kairos.toISOString());
  console.log('janus: ', janus.toISOString());

  janus = new Date(kairos);

  console.log('3rd log');
  console.log('kairos: ', kairos.toISOString());
  console.log('janus: ', janus.toISOString());

  janus = new Date(kairos.getTime() - 1);

  console.log('3rd log');
  console.log('kairos: ', kairos.toISOString());
  console.log('janus: ', janus.toISOString());
}

moros();
