using System;
using System.Collections.Generic;
using System.Linq;

namespace rm.Game2048
{
    public class Game2048 : IGame2048
    {
        #region members

        public int size { get; private set; }
        public int[,] grid { get; private set; }
        readonly int[] buffer;
        readonly int[] flatindexes;
        bool isWinner;
        bool isOkToGenerate;

        #endregion

        #region ctor

        public Game2048(int size)
        {
            if (!IsPowerOf2(size))
            {
                throw new Exception("size should be power of 2.");
            }
            this.size = size;
            grid = new int[size, size];
            buffer = new int[size];
            flatindexes = Enumerable.Range(0, size * size).ToArray();
            isWinner = false;
            isOkToGenerate = false;
        }

        #endregion

        #region IGame2048 methods

        #region commands

        public void Init()
        {
            for (int x = 0; x < size; x++)
            {
                for (int y = 0; y < size; y++)
                {
                    grid[x, y] = 0;
                }
            }
            isOkToGenerate = true;
            GenerateNew();
        }

        public void InitWith(int[,] state)
        {
            for (int x = 0; x < size; x++)
            {
                for (int y = 0; y < size; y++)
                {
                    if (state[x, y] != 0)
                    {
                        Validate(state[x, y]);
                    }
                    grid[x, y] = state[x, y];
                }
            }
            isOkToGenerate = true;
        }
        private bool Validate(int x)
        {
            var isValid = IsPowerOf2(x);
            if (!isValid)
            {
                throw new Exception("invalid x");
            }
            return isValid;
        }
        private bool IsPowerOf2(int x)
        {
            return (x > 0 && (x & (x - 1)) == 0);
        }

        static readonly int[] newElements = { 2, 2, 2, 2, 2, 2, 2, 2, 4, 4 }; //80-20%
        static readonly Random rng = new Random();
        public void GenerateNew()
        {
            if (isOkToGenerate)
            {
                var maxtries = size * size;
                var tries = 0;
                var shuffled = Shuffle(flatindexes);
                foreach (var xy in GetRandomXY(shuffled))
                {
                    var x = xy.Item1;
                    var y = xy.Item2;
                    if (grid[x, y] == 0)
                    {
                        grid[x, y] = newElements[rng.Next(newElements.Length)];
                        break;
                    }
                    tries++;
                    if (tries == maxtries)
                    {
                        throw new Exception("reached maxtries");
                    }
                }
            }
            isOkToGenerate = false;
        }
        private IEnumerable<int> Shuffle(int[] a)
        {
            var rng = new Random();
            for (int i = a.Length - 1; i >= 0; i--)
            {
                var next = rng.Next(i + 1);
                yield return a[next];
                var t = a[next];
                a[next] = a[i];
                a[i] = t;
            }
        }
        private IEnumerable<Tuple<int, int>> GetRandomXY(IEnumerable<int> shuffled)
        {
            foreach (var xy in shuffled)
            {
                var x = (xy & (~(size - 1))) >> CountOf1Bits(size - 1); // xy / size
                var y = xy & (size - 1); // xy % size
                yield return new Tuple<int, int>(x, y);
            }
        }

        private int CountOf1Bits(int n)
        {
            var count = 0;
            while (n > 0)
            {
                n &= n - 1;
                count++;
            }
            return count;
        }

        public void Undo()
        {
            throw new NotImplementedException();
        }

        public bool IsWinner()
        {
            return isWinner;
        }

        public bool HasEnded()
        {
            var hasEnded = true;
            for (int x = 0; x < size; x++)
            {
                for (int y = 0; y < size; y++)
                {
                    if (grid[x, y] == 0)
                    {
                        hasEnded = false;
                        return hasEnded;
                    }
                    if (y + 1 < size && grid[x, y] == grid[x, y + 1])
                    {
                        hasEnded = false;
                        return hasEnded;
                    }
                    if (x + 1 < size && grid[x, y] == grid[x + 1, y])
                    {
                        hasEnded = false;
                        return hasEnded;
                    }
                }
            }
            return hasEnded;
        }

        #endregion

        #region slide

        public int[] Slide(int[] buffer)
        {
            var backup = (int[])buffer.Clone();
            var target = 0;
            for (int i = 0; i < size; i++)
            {
                if (buffer[i] == 0)
                {
                    continue;
                }
                buffer[target] = buffer[i];
                isOkToGenerate |= (target != i);
                target++;
            }
            while (target < size)
            {
                buffer[target] = 0;
                target++;
            }
            target = 0;
            for (int i = 0; i < size; i++)
            {
                if (buffer[i] == 0)
                {
                    break;
                }
                if (i + 1 < size && buffer[i] == buffer[i + 1])
                {
                    buffer[target] = buffer[i] << 1;
                    i++;
                    if (buffer[target] == 2048)
                    {
                        isWinner = true;
                    }
                    isOkToGenerate |= true;
                }
                else
                {
                    buffer[target] = buffer[i];
                    isOkToGenerate |= (target != i);
                }
                target++;
            }
            while (target < size)
            {
                buffer[target] = 0;
                target++;
            }
            return backup;
        }

        public void SlideRight()
        {
            Console.WriteLine("-->");
            for (int x = 0; x < size; x++)
            {
                var i = 0;
                for (int y = size - 1; y >= 0; y--)
                {
                    buffer[i] = grid[x, y];
                    i++;
                }
                var before = Slide(buffer);
                i = 0;
                for (int y = size - 1; y >= 0; y--)
                {
                    grid[x, y] = buffer[i];
                    i++;
                }
            }
        }
        public void SlideLeft()
        {
            Console.WriteLine("<--");
            for (int x = 0; x < size; x++)
            {
                var i = 0;
                for (int y = 0; y < size; y++)
                {
                    buffer[i] = grid[x, y];
                    i++;
                }
                var before = Slide(buffer);
                i = 0;
                for (int y = 0; y < size; y++)
                {
                    grid[x, y] = buffer[i];
                    i++;
                }
            }
        }
        public void SlideDown()
        {
            Console.WriteLine("\\/");
            for (int y = 0; y < size; y++)
            {
                var i = 0;
                for (int x = size - 1; x >= 0; x--)
                {
                    buffer[i] = grid[x, y];
                    i++;
                }
                var before = Slide(buffer);
                i = 0;
                for (int x = size - 1; x >= 0; x--)
                {
                    grid[x, y] = buffer[i];
                    i++;
                }
            }
        }
        public void SlideUp()
        {
            Console.WriteLine("/\\");
            for (int y = 0; y < size; y++)
            {
                var i = 0;
                for (int x = 0; x < size; x++)
                {
                    buffer[i] = grid[x, y];
                    i++;
                }
                var before = Slide(buffer);
                i = 0;
                for (int x = 0; x < size; x++)
                {
                    grid[x, y] = buffer[i];
                    i++;
                }
            }
        }

        #endregion

        #endregion
    }
}
