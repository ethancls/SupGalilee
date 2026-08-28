import java.util.Random;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.beans.property.DoubleProperty;
import javafx.beans.property.SimpleDoubleProperty;
import javafx.css.Rule;
import javafx.scene.*;
import javafx.scene.control.Button;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.paint.PhongMaterial;
import javafx.scene.shape.Box;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.scene.transform.Rotate;
import javafx.scene.transform.Transform;
import javafx.stage.Stage;
import javafx.util.Duration;

@SuppressWarnings("unused")
public class GFX_Cube extends Application {

    private final int WIDTH = 1300;
    private final int HEIGHT = 1000;
    private static int X;
    private static int Y;
    private static int Z;
    private int SMALL_BOX_SIZE = 5;
    public static STRUCT_Grid_ND grid;
    private int generation = 0;
    private Timeline timeline;

    public GFX_Cube() {
        // Default constructor
    }

    public GFX_Cube(STRUCT_Grid_ND grid, String content) {
        GFX_Cube.grid = grid;
        X = grid.getDimensions()[0];
        Y = grid.getDimensions()[1];
        Z = grid.getDimensions()[2];
    }

    private double anchorX, anchorY;
    private double anchorAngleX = 0;
    private double anchorAngleY = 0;
    private final DoubleProperty angleX = new SimpleDoubleProperty(0);
    private final DoubleProperty angleY = new SimpleDoubleProperty(0);

    @Override
    public void start(Stage primaryStage) {
        SmartGroup group = new SmartGroup();
        createCube(group);

        Camera camera = new PerspectiveCamera();
        SubScene subScene = new SubScene(group, WIDTH, HEIGHT, true, SceneAntialiasing.BALANCED);
        subScene.setFill(Color.BLACK);
        subScene.setCamera(camera);

        Text generationCounter = new Text();
        generationCounter.setFill(Color.WHITE);
        generationCounter.setFont(Font.font(20));

        Button startButton = new Button("Start");
        Button stopButton = new Button("Stop");

        startButton.setOnAction(event -> timeline.play());
        stopButton.setOnAction(event -> timeline.stop());

        HBox buttons = new HBox(10, startButton, stopButton);
        buttons.setTranslateX(10);
        buttons.setTranslateY(10);

        StackPane root = new StackPane();
        root.getChildren().addAll(subScene, generationCounter, buttons);
        StackPane.setAlignment(generationCounter, javafx.geometry.Pos.BOTTOM_LEFT);
        StackPane.setAlignment(buttons, javafx.geometry.Pos.TOP_LEFT);

        Scene scene = new Scene(root, WIDTH, HEIGHT);

        double initialDistance = X * SMALL_BOX_SIZE;
        group.translateXProperty().set(WIDTH / 2);
        group.translateYProperty().set(HEIGHT / 2);
        group.translateZProperty().set(initialDistance);

        initMouseControl(group, scene);

        primaryStage.addEventHandler(KeyEvent.KEY_PRESSED, event -> {
            switch (event.getCode()) {
                case Z:
                    group.translateZProperty().set(group.getTranslateZ() - 100);
                    break;
                case S:
                    group.translateZProperty().set(group.getTranslateZ() + 100);
                    break;
                default:
                    break;
            }
        });

        primaryStage.setTitle("3D GameOfLife");
        primaryStage.setScene(scene);
        primaryStage.show();

        timeline = new Timeline(new KeyFrame(Duration.seconds(0.75), e -> {
            updateCube();
            createCube(group);
            generation++;
            generationCounter.setText("Generation: " + generation);
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);
    }

    private void updateCube() {
        STRUCT_Grid_ND new_grid = new STRUCT_Grid_ND(grid.getDimensions());

        for (int x = 0; x < X; x++) {
            for (int y = 0; y < Y; y++) {
                for (int z = 0; z < Z; z++) {
                    if (new Rule3D().isAlive(grid, x, y, z)){
                        new_grid.getCell(x, y, z).setCellValue(true);
                    } else {
                        new_grid.getCell(x, y, z).setCellValue(false);
                    }
                }
            }
        }
        STRUCT_Grid_ND temp = grid;
        grid = new_grid;
        new_grid = temp;
    }

    private void createCube(SmartGroup group) {
        group.getChildren().removeIf(node -> node instanceof Box);
        for (int x = 0; x < X; x++) {
            for (int y = 0; y < Y; y++) {
                for (int z = 0; z < Z; z++) {
                    if (grid.getCell(x, y, z).getCellValue()) {
                        Box box = new Box(SMALL_BOX_SIZE, SMALL_BOX_SIZE, SMALL_BOX_SIZE);
                        PhongMaterial material = new PhongMaterial();
                        material.setDiffuseColor(Color.RED);
                        material.setSpecularColor(Color.RED);
                        box.setMaterial(material);
                        box.setTranslateX(x * (SMALL_BOX_SIZE) - (X * (SMALL_BOX_SIZE) / 2));
                        box.setTranslateY(y * (SMALL_BOX_SIZE) - (Y * (SMALL_BOX_SIZE) / 2));
                        box.setTranslateZ(z * (SMALL_BOX_SIZE) - (Z * (SMALL_BOX_SIZE) / 2));
                        group.getChildren().add(box);
                    }
                }
            }
        }
    }

    private void initMouseControl(SmartGroup group, Scene scene) {
        Rotate xRotate;
        Rotate yRotate;
        group.getTransforms().addAll(
                xRotate = new Rotate(0, Rotate.X_AXIS),
                yRotate = new Rotate(0, Rotate.Y_AXIS));
        xRotate.angleProperty().bind(angleX);
        yRotate.angleProperty().bind(angleY);

        scene.setOnMousePressed(event -> {
            anchorX = event.getSceneX();
            anchorY = event.getSceneY();
            anchorAngleX = angleX.get();
            anchorAngleY = angleY.get();
        });

        scene.setOnMouseDragged(event -> {
            angleX.set(anchorAngleX - (anchorY - event.getSceneY()));
            angleY.set(anchorAngleY + anchorX - event.getSceneX());
        });
    }

    class SmartGroup extends Group {

        Rotate r;
        Transform t = new Rotate();

        void rotateByX(int ang) {
            r = new Rotate(ang, Rotate.X_AXIS);
            t = t.createConcatenation(r);
            this.getTransforms().clear();
            this.getTransforms().addAll(t);
        }

        void rotateByY(int ang) {
            r = new Rotate(ang, Rotate.Y_AXIS);
            t = t.createConcatenation(r);
            this.getTransforms().clear();
            this.getTransforms().addAll(t);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
