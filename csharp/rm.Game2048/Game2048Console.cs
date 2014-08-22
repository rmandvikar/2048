using System;
using System.Collections.Generic;

namespace rm.Game2048
{
    public class Game2048Console
    {
        #region members

        readonly IGame2048 game;

        #endregion

        #region ctor

        public Game2048Console(IGame2048 game)
        {
            this.game = game;
        }

        #endregion

        #region methods

        public void Start()
        {
            game.Init();
            //game.InitWith(new[,] { 
            //    { 4, 2, 4, 2 }, 
            //    { 2, 4, 2, 4 }, 
            //    { 4, 2, 4, 2 }, 
            //    { 0, 4, 2, 4 }, 
            //});
            Print();
            Console.WriteLine("use arrows to play. escape to quit.");
            Console.WriteLine();
            var quit = false;
            while (true)
            {
                var key = Console.ReadKey(false).Key;
                switch (key)
                {
                    #region commands
                    case ConsoleKey.Q:
                    case ConsoleKey.Escape:
                        Console.WriteLine("quitting...");
                        Print();
                        quit = true;
                        break;
                    case ConsoleKey.N:
                        Console.WriteLine("new game");
                        game.Init();
                        Print();
                        break;
                    case ConsoleKey.U:
                        Console.WriteLine("undo");
                        //game.Undo();
                        Print();
                        break;
                    #endregion

                    #region slide
                    case ConsoleKey.RightArrow:
                        game.SlideRight();
                        game.GenerateNew();
                        Print();
                        break;
                    case ConsoleKey.LeftArrow:
                        game.SlideLeft();
                        game.GenerateNew();
                        Print();
                        break;
                    case ConsoleKey.UpArrow:
                        game.SlideUp();
                        game.GenerateNew();
                        Print();
                        break;
                    case ConsoleKey.DownArrow:
                        game.SlideDown();
                        game.GenerateNew();
                        Print();
                        break;
                    #endregion
                }
                if (game.IsWinner())
                {
                    Console.WriteLine("winner!!1");
                    break;
                }
                if (game.HasEnded())
                {
                    Console.WriteLine("sorry, you lost. try again :(");
                    break;
                }
                if (quit)
                {
                    break;
                }
            }
            Console.ReadKey();
        }

        public void Test()
        {
            new List<int[]>(new[] {
                new[] { 0, 2, 4, 4 }, 
                new[] { 4, 4, 2, 0 }, 
                new[] { 2, 2, 0, 0 }, 
                new[] { 0, 0, 2, 2 }, 
                new[] { 0, 2, 2, 0 }, 
                new[] { 2, 0, 0, 2 }, 
                new[] { 2, 4, 4, 2 }, 
                new[] { 4, 4, 2, 2 }, 
                new[] { 0, 2, 4, 4 }, 
                new[] { 2, 4, 8, 16 }, 
                new[] { 2, 2, 2, 2 }, 
                new[] { 0, 0, 0, 0 }, 
            }).ForEach(x => game.Slide(x));
        }

        public void Print()
        {
            for (int x = 0; x < game.size; x++)
            {
                for (int y = 0; y < game.size; y++)
                {
                    Console.BackgroundColor = ConsoleColor.White;
                    Console.ForegroundColor = Decorate(game.grid[x, y]);
                    Console.Write("{0,4}", (game.grid[x, y] == 0 ? "" : game.grid[x, y].ToString()));
                    Console.ResetColor();
                    Console.Write(" ");
                }
                Console.WriteLine();
            }
            Console.WriteLine();
        }
        private ConsoleColor Decorate(int n)
        {
            return (ConsoleColor)GetExponentBase2(n);
        }
        private int GetExponentBase2(int n)
        {
            var e = 0;
            while (n > 1)
            {
                n = n >> 1;
                e++;
            }
            return e;
        }

        #endregion
    }
}
