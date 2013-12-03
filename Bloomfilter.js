(function (root) {
  "use strict";
  // Hash Functions (Credit to http://erlycoder.com/)
  var hashCode = function (str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0, l = str.length; i < l; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
  var djb2Code = function (str) {
    var hash = 5381;
    for (var i = 0, l = str.length; i < l; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; // Hash * 33 + c 
    }
    return hash;
  };

  // Function PARAMETERS m= vertor size, k= # of hash functions
  var Bloomfilter = function (m, k) {
    var defaults = {
      m: 256,
      k: 3
    };
    this.m = Math.ceil(m);
    this.k = Math.ceil(k);
    this.bitVector = [];
    this.locations = [];

    if (!this.m) this.m = defaults.m;
    if (!this.k) this.k = defaults.k;

    if(typeof this.m !== "number" || typeof this.k !== "number") 
      throw new Error("Error- Parameters are not type int");

    if(this.m < 1 ||  this.k < 1) 
      throw new Error("Error- Parameters are too small");

    for (var i = 0, l = Math.ceil(this.m); i < l; i++) 
       this.bitVector[i] = 0;
  };

  // Function that locates the bit in bitVector with multiple hashing
   Bloomfilter.prototype.locate = function (word) {
    var m = this.m;
    var location = this.locations;
    var hash1 = djb2Code(word);
    var hash2 = hashCode(word);
    var result = hash1 % m;
    for(var i =0, l = this.k; i < l; i++){
      location[i] = result < 0 ? (result + m) : result;
      result = (result + hash2) % m;
    }
    return location;
  };

  // Function that Add to bitVector and set to it to true
  Bloomfilter.prototype.add = function (word) {
    if (typeof word !== "string" || word.trim().length === 0)
      throw new Error("Error- Parameter is not type string");

    var location = this.locate(word);
    var bV = this.bitVector;

    for(var i = 0, k = this.k; i< k; i++)
      bV[Math.ceil(location[i])] = 1;   
  };

  // Function that Check in the bitVector 
  Bloomfilter.prototype.check = function (word) {
    if (typeof word !== "string" || word.trim().length === 0)
      throw new Error("Error- Parameter is not type string");

    var location = this.locate(word);
    var bV = this.bitVector;

    for(var i = 0, k = this.k; i< k; i++)
      if (bV[Math.ceil(location[i])] === 0) return false;

    return true;
  };

  root.Bloomfilter = Bloomfilter;

}(this));

///////////////////////////////////////////
// TESTING
///////////////////////////////////////////
var arr = ["enrique", "car", "thomas", "computer", "work"];
var b1 = new Bloomfilter(64, 5);
for(var i = 0, l = arr.length; i < l; i++){
  b1.add(arr[i]);
}
console.log("Array: ", arr);
console.log("Might Contain 'car'?", b1.check('car'));
console.log("Might Contain 'mother'?", b1.check('mother'));
console.log("Might Contain 'computer'?", b1.check('computer'));
console.log("Might Contain 'room'?", b1.check('room'));
console.log("Might Contain 'computer'?", b1.check('computer'));

console.log("Array: ", ["Hello", "World"]);
var b2 = new Bloomfilter(); // By Default k= 3, m= 256
b2.add("Hello");
b2.add("World");
console.log("Might Contain 'World'?", b2.check("World"));
console.log("Might Contain 'computer'?", b2.check("computer"));
