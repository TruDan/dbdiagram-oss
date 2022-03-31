
function snapSingle(value, snapSize) {
  return Math.round(value/snapSize)*snapSize;
}

export function snap(value, snapSize) {
  console.log("snap", value, snapSize);
  if(typeof value === "number") {
    return snapSingle(value, snapSize);
  }
  else if('x' in value && 'y' in value) {
    value.x = snapSingle(value.x);
    value.y = snapSingle(value.y);
    return value;
  }
  return value;
}
export default { snap };
