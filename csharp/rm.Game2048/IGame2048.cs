using System;

namespace rm.Game2048
{
    public interface IGame2048
    {
        #region members

        int size { get; }
        int[,] grid { get; }

        #endregion

        #region commands

        void Init();
        void InitWith(int[,] grid);
        void GenerateNew();
        void Undo();
        bool IsWinner();
        bool HasEnded();

        #endregion

        #region slide

        int[] Slide(int[] buffer);
        void SlideRight();
        void SlideLeft();
        void SlideUp();
        void SlideDown();

        #endregion
    }
}
