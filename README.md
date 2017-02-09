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

__Variable Declarations__

```
name = "guav"                               let name = “guav”
age = 21                                    var age = 21
female = True                               let female = true
```

__Constant Declarations__

```
PI = 3.14159265359                         const PI = 3.14159265359
```

__Arithmetic__

```
((2 + 3) * (6 - 1) ^ 2) / 4                ((2 + 3) * Math.pow((6 - 1), 2)) / 4
```

__While Statements__

```
while True {                               while (true) {
   ret True                                   return true
}                                          }
```

__Conditional Statements__

```
x == 2 ? x -= 1 : x += 1                   (x == 2) ? x -= 1 : x += 1
```

__Functions__

```
multiply (x, y) {                           var multiply = (x, y) => {
   ret x * y                                   return x * y;
}                                           }
```

```
numbers = [1, 2, 3, 4, 5, 6]                let numbers = [1, 2, 3, 4, 5, 6]
add_even_numbers () {                       add_even_numbers = () => {
   result = 0                                   let result = 0
   for i in numbers {                           for (i in numbers) {
      if i % 2 == 0 {                              if (i % 2 === 0) {
         result += i                                   result += i
      }                                            }
   }                                            }
   ret result                                   return result
}                                            }
```
__Class Declarations__
```
class Ball {                                 class Ball {
	is_round() {                                 let is_round = () => {
    	ret True                                     return true
    }                                           }
}                                            }
```
