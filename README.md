![Guavascript Logo](https://raw.githubusercontent.com/AnsonAdams/guavascript/master/images/Guavascript%20logo.png "Guavascript Logo")

## Introduction

Guavascript is a strongly and statically typed language that compiles down to Javascript. With type inference, first class functions, and other features, Guavascript's goal is to enable a programmer to sketch out ideas quickly without sacrificing focus to lower-level details. For example, the language is designed with a minimalistic approach to reduce the amount of time programmers have to spend typing a worrying about language-specific syntax. Similarly, Guavascript incorporates pattern matching and the for-in loop to produce a more intuitive programming language that cuts out unnecessary in-between logic. Guavascript takes much inspiration from Python for its expressiveness and high-level abstraction.

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
* Boolean: `true`, `false`
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
female = true                               let female = true
```

__Constant Declarations__

```
PI = 3.14159265359                         const PI = 3.14159265359
```

__Arithmetic__

```
x = ((2 + 3) * (6 - 1) ^ 2) / 4            x = ((2 + 3) * Math.pow((6 - 1), 2)) / 4
```

__While Statements__

```
while true {                               while (true) {
   ret true                                   return true
}                                          }
```

__Conditional Statements__

```
x == 2 ? x -= 1 : x += 1                   (x == 2) ? x -= 1 : x += 1
```

__Match Statements__

```
match fruit with                           
    | pear   -> puke.exe()                 if (fruit == pear) { puke.exe(); }
    | apple  -> puke.exe()                 else if (fruit == apple) { puke.exe(); }
    | banana -> puke.exe()                 else if (fruit == banana) { puke.exe(); }
    | guava  -> observe("delicious")       else if (fruit == guava) {
                observe("nutritious")          observe("delicious");
    | _      -> puke.exe()                     observe("nutritious");
                                           } else { puke.exe(); }
```

__Functions__

```
multiply (x, y) {                           var multiply = (x, y) => {
   ret x * y                                   return x * y;
}                                           }
```

```
numbers = [1, 2, 3, 4, 5, 6]                let numbers = [1, 2, 3, 4, 5, 6];
add_even_numbers() {                        add_even_numbers = () => {
    result = 0                                  var result = 0;
    for num in numbers {                            for (var i in numbers) {
        if num % 2 == 0 {                               if (numbers[i] % 2 === 0) {
            result += i                                     result += i;
        }                                               }
    }                                               }
    ret result                                   return result;
}                                            }
```

__Higher-Order Functions__

```
doTwice (f, x) {                            var doTwice = (f, x) => {
   ret f(f(x))                                  return f(f(x));
}                                           }
```

__Class Declarations__

```
class Ball {                                 class Ball {
    Ball (radius, weight = 1.0) {                constructor(radius, weight) {
    	this.radius = radius                         this.radius = radius;
	       this.weight = weight                  this.weight = weight;
    }                                        }
    is_round() {                                 var is_round = () => {
    	ret true                                     return true
    }                                            }
}                                            }

bouncyBall = Ball(0.2)                       let bouncyBall = new Ball(0.2, 1.0);
bouncyBall.is_round()                        bouncyBall.is_round();
```

## Semantic Errors
* UseBeforeDeclaration Error: Calling a variable outside the scope where it is declared
* missingConstructor Error: Classes not defined with "constructor" keyword
* incorrectType Error: For in used for anything besides arrays, tuples, or dictionaries
* incorrectType Error: If statment conditions returning non-boolean type
* incorrectType Error: Variables not matched with same type in match statement
* invalidParams Error: Function/class call arguments don't match function/class declaration parameters
* missingCatchAllError: Match statments without catch all (except for boolean, in which true and false must be present)
* unusedVariable: Declared variables not being used
* invalidBinaryOperands Error: Invalid operations. For example, {"one":"two"} + {"three":"four"}, {"te":"st"}[0], false/false, 2 * true, "test" * 2, ["one"] + {"t":"wo"}, [1] + 2, {1} + 2, (1, 2) + (3, 4), ["x"]["y"], 2 > true, etc
* invalidUnaryOperand Error: Incorrect post operation. For example, ["x"]++, !2, "string"--, etc.
* changedImmutableType Error: Reassigning variable to the wrong type. For example 1 -> true, "x" -> 3, etc
* notCalledAsAFunction Error: References to functions that are not function calls
* returnOutsideFunction Error: Return statements outside of function block
* multipleReturnsInABlock Error: More than one return statement in function block
