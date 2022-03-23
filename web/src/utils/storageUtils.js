
// export const encode = (value) => btoa(JSON.stringify(value));
// export const decode = (encoded) => JSON.parse(atob(encoded));
export const encode = (value) => JSON.stringify(value);
export const decode = (encoded) => JSON.parse(encoded);

export const del = (key) => {
  const item = localStorage.getItem(`dbml-${key}`);
  if (item) {
    localStorage.removeItem(`dbml-${key}`);
  }
};
export const save = (key, value) => {
  localStorage.setItem(`dbml-${key}`, encode(value));
};

export const load = (key) => {
  const value = localStorage.getItem(`dbml-${key}`);
  if (value) {
    return decode(value);
  }
  return undefined;
};

export const list = () => {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^dbml-.*/.test(key)) {
      items.push(key.replace(/^dbml-(.*)/, "$1"));
    }
  }
  return items;
};
