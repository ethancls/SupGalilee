import javax.swing.JButton;
import javax.swing.JFrame;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;

public class GFX_Start extends JFrame {

    private boolean simulationRunning = false;
    private JButton startStopButton;

    public GFX_Start() {
        setTitle("Simulation Control");
        setSize(200, 100);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        startStopButton = new JButton("Start");
        startStopButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                simulationRunning = !simulationRunning;
                startStopButton.setText(simulationRunning ? "Stop" : "Start");
            }
        });
        add(startStopButton);
    }

    public boolean isSimulationRunning() {
        return simulationRunning;
    }
}
