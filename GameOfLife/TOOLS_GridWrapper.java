public class TOOLS_GridWrapper {

    private STRUCT_Grid_ND grid;
    public int GENERATIONS = 0;

    public TOOLS_GridWrapper(STRUCT_Grid_ND grid) {
        this.grid = grid;
    }

    public STRUCT_Grid_ND getGrid() {
        return grid;
    }

    public void setGrid(STRUCT_Grid_ND grid) {
        this.grid = grid;
    }
}