import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

interface Neighborhood {
    List<int[]> getNeighbors(int... position);
}

public class TOOLS_Neighborhoods {
    private static final List<CustomNeighborhood> customNeighborhoods = new ArrayList<>();

    // Predefined neighborhoods
    public static final Neighborhood G0 = position -> List.of(position);
    public static final Neighborhood G2 = position -> List.of(
            new int[]{position[0] - 1},
            position,
            new int[]{position[0] + 1}
    );
    public static final Neighborhood G4 = position -> List.of(
            new int[]{position[0] - 1, position[1]},
            new int[]{position[0] + 1, position[1]},
            position,
            new int[]{position[0], position[1] - 1},
            new int[]{position[0], position[1] + 1}
    );
    public static final Neighborhood G8 = position -> List.of(
            new int[]{position[0] - 1, position[1] - 1},
            new int[]{position[0] - 1, position[1]},
            new int[]{position[0] - 1, position[1] + 1},
            new int[]{position[0], position[1] - 1},
            position,
            new int[]{position[0], position[1] + 1},
            new int[]{position[0] + 1, position[1] - 1},
            new int[]{position[0] + 1, position[1]},
            new int[]{position[0] + 1, position[1] + 1}
    );
    public static final Neighborhood G6 = position -> List.of(
            position,
            new int[]{position[0] - 1, position[1], position[2]},
            new int[]{position[0] + 1, position[1], position[2]},
            new int[]{position[0], position[1] - 1, position[2]},
            new int[]{position[0], position[1] + 1, position[2]},
            new int[]{position[0], position[1], position[2] - 1},
            new int[]{position[0], position[1], position[2] + 1}
    );
    public static final Neighborhood G26 = position -> {
        List<int[]> neighbors = new ArrayList<>();
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                for (int k = -1; k <= 1; k++) {
                    neighbors.add(new int[]{position[0] + i, position[1] + j, position[2] + k});
                }
            }
        }
        return neighbors;
    };

    public static final Neighborhood G2Star = position -> G2.getNeighbors(position).stream()
            .filter(neighbor -> !java.util.Arrays.equals(neighbor, position))
            .collect(Collectors.toList());

    public static final Neighborhood G4Star = position -> G4.getNeighbors(position).stream()
            .filter(neighbor -> !java.util.Arrays.equals(neighbor, position))
            .collect(Collectors.toList());

    public static final Neighborhood G8Star = position -> G8.getNeighbors(position).stream()
            .filter(neighbor -> !java.util.Arrays.equals(neighbor, position))
            .collect(Collectors.toList());

    public static final Neighborhood G6Star = position -> G6.getNeighbors(position).stream()
            .filter(neighbor -> !java.util.Arrays.equals(neighbor, position))
            .collect(Collectors.toList());

    public static final Neighborhood G26Star = position -> G26.getNeighbors(position).stream()
            .filter(neighbor -> !java.util.Arrays.equals(neighbor, position))
            .collect(Collectors.toList());

    public static Neighborhood getNeighborhoodByName(String name) {
        switch (name) {
            case "G0":
                return G0;
            case "G2":
                return G2;
            case "G4":
                return G4;
            case "G8":
                return G8;
            case "G6":
                return G6;
            case "G26":
                return G26;
            case "G2*":
                return G2Star;
            case "G4*":
                return G4Star;
            case "G8*":
                return G8Star;
            case "G6*":
                return G6Star;
            case "G26*":
                return G26Star;
            default:
                for (CustomNeighborhood custom : customNeighborhoods) {
                    if (custom.getName().equals(name)) {
                        return custom.getNeighborhood();
                    }
                }
                return null;
        }
    }

    public static void addCustomNeighborhood(String name, List<int[]> neighbors) {
        Neighborhood customNeighborhood = position -> {
            List<int[]> absoluteNeighbors = new ArrayList<>();
            for (int[] neighbor : neighbors) {
                int[] absoluteNeighbor = new int[position.length];
                for (int i = 0; i < position.length; i++) {
                    absoluteNeighbor[i] = position[i] + neighbor[i];
                }
                absoluteNeighbors.add(absoluteNeighbor);
            }
            return absoluteNeighbors;
        };
        customNeighborhoods.add(new CustomNeighborhood(name, customNeighborhood));
    }

    public String toString() {
        return "********* NEIGHBORHOODS **********\n"
                + "Predefined neighborhoods: G0, G2, G4, G8, G6, G26, G2*, G4*, G8*, G6*, G26*\n"
                + "Custom neighborhoods: " + customNeighborhoods.stream().map(CustomNeighborhood::getName).collect(Collectors.joining(", ")) + "\n";
    }

    private static class CustomNeighborhood {
        private final String name;
        private final Neighborhood neighborhood;

        public CustomNeighborhood(String name, Neighborhood neighborhood) {
            this.name = name;
            this.neighborhood = neighborhood;
        }

        public String getName() {
            return name;
        }

        public Neighborhood getNeighborhood() {
            return neighborhood;
        }
    }
}
