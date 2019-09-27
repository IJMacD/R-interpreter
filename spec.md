# Knock-off R Spec

## Sample Data

|outlook     |temperature |humidity    |wind    |play |
|------------|------------|------------|--------|-----|
|sunny       |20          |high        |9       |NO   |
|sunny       |18          |high        |4       |NO   |
|overcast    |5           |high        |0       |YES  |
|rainy       |8           |high        |10      |YES  |
|rainy       |10          |normal      |12      |YES  |
|rainy       |13          |normal      |5       |NO   |
|rainy       |14          |normal      |7       |NO   |
|sunny       |15          |low         |11      |YES  |
|overcast    |7           |high        |9       |YES  |
|rainy       |14          |moderate    |14      |YES  |
|sunny       |20          |high        |44      |NO   |
|overcast    |22          |low         |5       |NO   |
|rainy       |12          |medium      |0       |YES  |

## Reading Files

```
> data <- readcsv('tennis.csv')
> readcsv('tennis.csv') -> data
```

## Selecting Data

```
> data$temperature
5
8
10
13
14
15
7
14
20
22
12
```

## Filtering Data

```
> data[temperature > 10,]
outlook     temperature humidity    wind    play
sunny       20          high        9       NO
sunny       18          high        4       NO
rainy       13          normal      5       NO
rainy       14          normal      7       NO
sunny       15          low         11      YES
rainy       14          moderate    14      YES
sunny       20          high        44      NO
overcast    22          low         5       NO
rainy       12          medium      0       YES
> data[temperature > 10 && wind > 10,]
outlook     temperature humidity    wind    play
sunny       15          low         11      YES
rainy       14          moderate    14      YES
sunny       20          high        44      NO
```

## Ranges

```
> 1:5
1
2
3
4
5
```

## Ranges on Data

```
> data[1:5,]
outlook     temperature humidity    wind    play
sunny       20          high        9       NO
sunny       18          high        4       NO
rainy       13          normal      5       NO
rainy       14          normal      7       NO
sunny       15          low         11      YES

> 1:2:5
1
3
5
> data[1:2:5,]
outlook     temperature humidity    wind    play
sunny       20          high        9       NO
rainy       13          normal      5       NO
sunny       15          low         11      YES
```

## Combined range and selections

```
> data[1,"outlook";"wind"]
outlook     wind
sunny       9
```

## Function definitions

```
> 3 -> a
> 0 -> b
> 1 -> c
> f(x) = a * x^2 + b * x + c
> f(1)
4
> 100 -> a
> f(1)
4
> f(x,a) = a * x^2 + b * x + c
> f(1,100)
101
```