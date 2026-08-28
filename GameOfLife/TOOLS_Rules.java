import java.util.List;

class ET extends OperatorNode {
    public ET(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return (left.getValue() != 0 && right.getValue() != 0) ? 1 : 0;
    }
}

class OU extends OperatorNode {
    public OU(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return (left.getValue() != 0 || right.getValue() != 0) ? 1 : 0;
    }
}

class NON extends OperatorNode {
    public NON(TreeNode left) {
        super(left);
    }

    @Override
    int getValue() {
        return (left.getValue() == 0) ? 1 : 0;
    }
}

class SUP extends OperatorNode {
    public SUP(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return (left.getValue() > right.getValue()) ? 1 : 0;
    }
}

class SUPEQ extends OperatorNode {
    public SUPEQ(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return (left.getValue() >= right.getValue()) ? 1 : 0;
    }
}

class EQ extends OperatorNode {
    public EQ(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return (left.getValue() == right.getValue()) ? 1 : 0;
    }
}

class ADD extends OperatorNode {
    public ADD(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return left.getValue() + right.getValue();
    }
}

class SUB extends OperatorNode {
    public SUB(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return left.getValue() - right.getValue();
    }
}

class MUL extends OperatorNode {
    public MUL(TreeNode left, TreeNode right) {
        super(left, right);
    }

    @Override
    int getValue() {
        return left.getValue() * right.getValue();
    }
}

class SI extends OperatorNode {
    public SI(TreeNode left, TreeNode middle, TreeNode right) {
        super(left, middle, right);
    }

    @Override
    int getValue() {
        return (left.getValue() != 0) ? middle.getValue() : right.getValue();
    }
}

class COMPTER extends TreeNode {
    private static STRUCT_Grid_ND grid;
    private static int[] position;
    private String voisinage;

    // Constructor to initialize the 'voisinage' variable
    public COMPTER(String voisinage) {
        this.voisinage = voisinage;
    }

    // Static method to set the grid and position for all COMPTER objects
    public static void setSettings(STRUCT_Grid_ND grid, int... position) {
        COMPTER.grid = grid;
        COMPTER.position = position;
    }

    // Method to get neighbors based on the current position and voisinage
    private List<int[]> getNeighbors() {
        return TOOLS_Neighborhoods.getNeighborhoodByName(voisinage).getNeighbors(position);
    }

    @Override
    int getValue() {
        int liveNeighbors = 0;
        List<int[]> neighbors = getNeighbors();
        for (int[] neighbor : neighbors) {
            try {
                if (grid.getCell(neighbor).getCellValue()) {
                    liveNeighbors++;
                }
            } catch (ArrayIndexOutOfBoundsException e) {
                // If the neighbor is out of bounds, treat it as a dead cell
            }
        }
        return liveNeighbors;
    }
}

class Rule3D {

    public boolean isAlive(STRUCT_Grid_ND grid, int ...position) 
    {
        int x = position[0];
        int y = position[1];
        int z = position[2];

        COMPTER.setSettings(grid, x, y, z);
        TOOLS_EvolutionRule rule3d = new TOOLS_EvolutionRule("SI(EQ(COMPTER(G0),1), SI(OU(EQ(COMPTER(G26*),5),EQ(COMPTER(G26*),6)),1,0) , SI(EQ(COMPTER(G26*),4),1,0))", false);
        rule3d.cursor = 0;
        return rule3d.createNode(rule3d.parseFile()).getValue() == 1;
    }
}

class Rule2D {

    public boolean isAlive(STRUCT_Grid_ND grid, int ...position) 
    {
        int x = position[0];
        int y = position[1];

        COMPTER.setSettings(grid, x, y);
        TOOLS_EvolutionRule rule2d = new TOOLS_EvolutionRule("SI(EQ(COMPTER(G0),1), SI(OU(EQ(COMPTER(G8*),2),EQ(COMPTER(G8*),3)),1,0),SI(EQ(COMPTER(G8*),3),1,0))", false);
        rule2d.cursor = 0;
        return rule2d.createNode(rule2d.parseFile()).getValue() == 1;
    }
}

public class TOOLS_Rules {

    public static int evaluate(TreeNode tree) {
        return tree.getValue();
    }
}
