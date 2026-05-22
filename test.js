const name = "Mateus";
const limit = "2";
const dataToEncode = name + '|' + limit;
const encoded = btoa(unescape(encodeURIComponent(dataToEncode)));
console.log("Encoded URL param: " + encoded);

const cParam = encoded;
const decoded = decodeURIComponent(escape(atob(cParam)));
const parts = decoded.split('|');
let preFilledName = parts[0];
let maxAdditionalGuests = Infinity;
if (parts.length > 1) {
  maxAdditionalGuests = parseInt(parts[1], 10);
  if (isNaN(maxAdditionalGuests)) maxAdditionalGuests = Infinity;
}
console.log("Name: " + preFilledName);
console.log("Max guests: " + maxAdditionalGuests);
