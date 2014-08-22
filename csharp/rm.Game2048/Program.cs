using System;

namespace rm.Game2048
{
    class Program
    {
        static void Main(string[] args)
        {
            new Game2048Console(new Game2048(size: 4)).Start();
            //new Game2048Console(new Game2048(size: 4)).Test();
        }
    }
}
