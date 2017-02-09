![Guavascript Logo] (/images/Guavascript logo.png)

## Introduction

Guavascript is a strongly and statically typed language that compiles down to Javascript. With type inference, first class functions, and other features, Guavascript's goal is to enable a programmer to sketch out ideas quickly without sacrificing focus to lower-level details. For example, the language is designed with a minimalistic approach to reduce the amount of time programmers have to spend typing a worrying about language-specific syntax. Similarly, Guavascript incorporates pattern matching and the for-in loop to produce a more innately intuitive programming language that cuts out unnecessary in-between logic. Guavascript takes much inspiration from Python for its expressiveness and high-level abstraction.

## Features
* .guav File Extension
* Curly Braces
* Pattern Matching
* Object-oriented
* First Class Functions
* Higher Order Functions
* Type Inference
* Static Typing
* Strong Typing
* Optional Parameters

### Operators

* Additive: `+`, `-`
* Multiplicative: `*`, `/`, `//`
* Exponentiation: `^`
* Relational: `<`, `>`, `>=`, `<=`, `==`, `!=`
* Boolean: `&&`, `||`

### Data Types

* Int: `4`, `8`, `666`
* Float: `4.0`, `3.1415926`, `0.7734`
* Boolean: `True`, `False`
* String: `“guava”`, `“Don’t throw guavas in the lavas”`, `“The guava said, \“I am delicious.\””`
* List (Heterogeneous allowed): `[1, 2, 3, 4, 5]`, `[“I”, 8, 50.4, “guavas”]`
* Tuple (Heterogeneous allowed): `(30, 0.5, “guava”)`
* Dictionary: `{key:“value”, bestColor:“Guava”, worstLanguage: “php”}`
* Comments: `# Single line comment`

## Example Programs
Guavascript on the left, Javascript on the right

__Printing__

```
print('hello, world!')                      console.log(‘hello, world!’)
```

__Variable Declarations__

```
name = "guav                                let name = “guav”
age = 21                                    var age = 21
female = true                               let female = true
```

__Constant Declarations__

```
FEET_IN_METER = 3.28084                     const FEET_IN_METER = 3.28084
```

__Arithmetic__

```
((2 + 3) * (6 - 1) ^ 2) / 4                ((2 + 3) * Math.pow((6 - 1), 2)) / 4
```

__Functions__

```
multiply (x, y) {                           var multiply = (x, y) => {
   return x * y                                return x * y;
}                                           }
```

```
count_by_two (n) {                          let count_by_two = (n) => {
   for i in range(n) {                         for (i = 0; i < n; i++) {
      if (i % 2 == 0) {                           if (i % 2 === 0) {
         print(i)                                    console.log(i);
      }                                           }
   }                                           }
}                                           }
```
