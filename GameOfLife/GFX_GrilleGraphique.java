import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JFrame;
import javax.swing.JPanel;

@SuppressWarnings("unused")
public class GFX_GrilleGraphique extends JPanel {
    private int largeur, hauteur, taille_case;
    private float scaleFactor = 1.0f; // Facteur d'échelle pour le zoom
    private int offsetX = 0, offsetY = 0; // Déplacement de la vue
    private JFrame window = new JFrame();
    private STRUCT_Grid_ND grid;

    private List<ColoredPoint> casesAColorier;

    public GFX_GrilleGraphique(STRUCT_Grid_ND grid, int largeur, int hauteur, int taille_case) {
        this.grid = grid;
        this.largeur = largeur;
        this.hauteur = hauteur;
        this.taille_case = taille_case;
        casesAColorier = new ArrayList<>(10);

        this.setBackground(Color.WHITE);

        window.setSize((largeur + 2) * taille_case, (hauteur + 4) * taille_case);
        window.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        window.setLocationRelativeTo(null);
        window.setTitle("Simulation");
        window.add(this);
        window.setVisible(true);

        this.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                int col = (int) ((e.getX() - taille_case * scaleFactor - offsetX) / (taille_case * scaleFactor));
                int row = (int) ((e.getY() - taille_case * scaleFactor - offsetY) / (taille_case * scaleFactor));
                if (col >= 0 && col < largeur && row >= 0 && row < hauteur) {
                    try {
                        grid.getCell(col, row).setCellValue(!grid.getCell(col, row).getCellValue());
                        if (grid.getCell(col, row).getCellValue()) {
                            System.out.println("<Cell>" + col + "," + row + "</Cell>");
                            grid.getCell(col, row).setCellValue(true);
                            colorierCase(col, row, Color.BLUE);
                        } else {
                            grid.getCell(col, row).setCellValue(false);
                            colorierCase(col, row, Color.WHITE);
                        }
                    } catch (ArrayIndexOutOfBoundsException ex) {
                        System.out.println("Error: Invalid cell");
                    }
                }
            }
        });

        this.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyChar() == 'z') {
                    zoomIn();
                } else if (e.getKeyChar() == 's') {
                    zoomOut();
                } else if (e.getKeyCode() == KeyEvent.VK_UP) {
                    offsetY += 10;
                    repaint();
                } else if (e.getKeyCode() == KeyEvent.VK_DOWN) {
                    offsetY -= 10;
                    repaint();
                } else if (e.getKeyCode() == KeyEvent.VK_LEFT) {
                    offsetX += 10;
                    repaint();
                } else if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
                    offsetX -= 10;
                    repaint();
                }
            }
        });

        this.setFocusable(true);
        this.requestFocusInWindow();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        
        Graphics2D g2d = (Graphics2D) g;
        g2d.scale(scaleFactor, scaleFactor);
        g2d.translate(offsetX / scaleFactor, offsetY / scaleFactor);

        // Cases
        for (ColoredPoint fillCell : casesAColorier) {
            int cellX = taille_case + (fillCell.getPoint().x * taille_case);
            int cellY = taille_case + (fillCell.getPoint().y * taille_case);
            g2d.setColor(fillCell.getColor());
            g2d.fillRect(cellX, cellY, (int) taille_case, (int) taille_case);
        }

        // Grille
        /*g.setColor(Color.BLACK);
		g.drawRect(taille_case, taille_case, largeur*taille_case, hauteur*taille_case);

		for (int i = taille_case; i <= largeur*taille_case; i += taille_case) {
			g.drawLine(i, taille_case, i, hauteur*taille_case+taille_case);
		}

		for (int i = taille_case; i <= hauteur*taille_case; i += taille_case) {
			g.drawLine(taille_case, i, largeur*taille_case+taille_case, i);
		}*/
    }

    

    public void colorierCase(int x, int y, Color color) {
        casesAColorier.add(new ColoredPoint(new Point(x, y), color));
        repaint();
    }

    private void zoomIn() {
        if (scaleFactor < 2.0) { // Maximum zoom level
            scaleFactor += 0.05;
            repaint();
        }
    }

    private void zoomOut() {
        if (scaleFactor > 0) { // Minimum zoom level
            scaleFactor -= 0.05;
            repaint();
        }
    }

    public int getLargeur() {
        return largeur;
    }

    public int getHauteur() {
        return hauteur;
    }

    private static class ColoredPoint {
        private Point point;
        private Color color;

        public ColoredPoint(Point point, Color color) {
            this.point = point;
            this.color = color;
        }

        public Point getPoint() {
            return point;
        }

        public Color getColor() {
            return color;
        }
    }
}
