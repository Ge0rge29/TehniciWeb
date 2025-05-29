-- ex1
removeOddHalfEven :: [Int] -> [Int]
removeOddHalfEven [] = []
removeOddHalfEven (x:xs)
  | odd x = removeOddHalfEven xs
  | even x = (x 'div' 2) : removeOddHalfEven xs
  | otherwise = removeOddHalfEven

  multDigits :: String -> Int
  multDigits [] = 1
  multDigits (c:cs)
    | isDigit c = (digitToInt c) * multDigits cs
    | otherwise = multDigits cs

    -- ex2
multiDigitsHOF :: String -> Int
multiDigitsHOF str = product
    $ map digitToInt
    $ filter isDigit str

--ex2 c
multDigitsLC :: String -> Int
multDigitsLC str = product
    [digitToInt c | c <- str, isDigit c]

-- ex3
doubleOddLTn :: [Int] -> Int -> [Int]
doubleOddLTn [] _ = []
doubleOddLTn (x:xs) n
  | odd x && x < n = (2 * x) : doubleOddLTn xs n
  | otherwise = doubleOddLTn xs n

-- ex 6 de examen
-- consideram doubleOddLTn si o tasnformam in foldr
-- sigur pica la examen
{-
Avem un alg pt transformare

PAsul 0: scriem in forma recursiva
doubleOddLTn :: [Int] -> Int -> [Int]
doubleOddLTn [] _ = []
doubleOddLTn (x:xs) n
  | odd x && x < n = (2 * x) : doubleOddLTn xs n
  | otherwise = doubleOddLTn xs n

Scopul este sa ducem aceasta in form proprietatii de universalitate

DACA
    g[] = init
    g(x:xs) = f x (g xs)
ATUUNCI
    g = foldr f init

Pasul 1: redenumim functia doubleOddLTn cu g

g [] _ = []
g (x:xs) n
  | odd x && x < n = (2 * x) : g xs n
  | otherwise = g xs n

Pasul 2: schimbam din guards in if-then-else
g [] _ = []
g (x:xs) n = if odd x && x < n
  then (2 * x) : g xs n
  else g xs n

Pasul 3: aplicam currying si uncurrying
g [] = \_ -> []
g (x:xs) = \n -> if (odd x && x < n)
  then (2 * x) : g xs n
  else g xs n

Pasul 4: aplicam proprietatea de universalitate
am gasit  deja ca init = \_ -> []
    g (x:xs) = f x (g xs)
    g (x:xs) = \n -> if (odd x && x < n)
      then (2 * x) : g xs n
      else g xs n
deci 
f x (g xs n) -> if (odd x && x < n)
  then (2 * x) : g xs n
  else g xs n

Pasul 5: redenumirea g xs = u (APROAPE DE FIECARE DATA)
f x u = \ n -> if (odd x && x < n)
  then (2 * x) : u n
  else u n

Pasul 6: extragem functia f
f = \x u -> \n -> if (odd x && x < n)
  then (2 * x) : u n
  else u n

pe care o scriem mai frumos
f = \x u n -> if (odd x && x < n)
  then (2 * x) : u n
  else u n

  in acest moment avem f si init, deci putem sa scriem g = foldr f init
-}

doubleOddLTnFoldr :: [Int] -> Int -> [Int]
doubleOddLTnFoldr = foldr (\ x u n -> if (odd x && x < n)
  then (2 * x) : u n
  else u n) (\_ -> [])

-- ex 5 tema cadou

-- ex 7
--a dat cate un punctaj pt fiecare
instance Show a => Show (LList a) where
  show Nil = "[]"
  show (Const x xs) = "[" ++ show x ++ " | " ++ show xs ++ "]"

instance Eq a => Eq (LList a) where
  Nil == Nil  == True
  (Const x xs) == (Const x' xs') = x == x' && xs == xs'

-- 7b

lAppend :: LList a -> LList a -> LList a
lAppend Nil l2 = l2
lAppend (Const x xs) l2 = Const x (lAppend xs l2)