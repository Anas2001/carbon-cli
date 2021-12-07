const peg = require("pegjs");
const grammar = `{
  function makeTypeNode(type, args) {
    return {
      type: type,
      arguments: args|| null,
    };
  }
}

// Scilla Type Parser
Type = Map / ADT / Primitive

// ADTs
ADT = List / Pair / Bool / Option / Nat
Pair = "Pair" _* "(" left:Type ")" _* "(" right:Type ")" { return makeTypeNode("Pair", [left, right]) }
List = "List" _* "(" of:Type ")" { return makeTypeNode("List", [of]) }
Nat = "Nat" { return makeTypeNode("Nat"); }
Bool = "Bool" { return makeTypeNode("Bool"); }
Option = "Option" _* "(" of:Type ")" { return makeTypeNode("Option", [of]); }

// Map
Map = "Map" _* "(" ktype:Primitive ")" _* "(" vtype:Type ")" { return makeTypeNode("Map", [ktype, vtype]) }

Primitive =
  prim:(Uint32 /
  Uint64 / 
  Uint128 / 
  Uint256 / 
  Int32 /
  Int64 /
  Int128 /
  Int256 /
  BNum /
  String / 
  Address / 
  ByStr /
  Hash) { return makeTypeNode(prim) }

// Numerical Types
Uint32 = "Uint32"
Uint64 = "Uint64"
Uint128 = "Uint128"
Uint256 = "Uint256"
Int32 = "Int32"
Int64 = "Int64"
Int128 = "Int128"
Int256 = "Int256"
BNum = "BNum"

// Byte-encoded Types
String = "String"
Address = "Address"
Hash = "Hash"
ByStr = "ByStr"X:[0-9]+ { return "ByStr" + X.join('') }

_ = [ \\t\\n]
`;

module.exports = peg.generate(grammar);