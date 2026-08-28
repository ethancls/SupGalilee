import javax.swing.JFileChooser;
import javax.swing.JFrame;
import java.io.File;
import javax.swing.filechooser.FileNameExtensionFilter;

public class TOOLS_ConfigLoader {

    public String askForFilePath() {
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Sélectionner le fichier de configuration");

        // Ajouter un filtre pour les fichiers XML
        FileNameExtensionFilter xmlFilter = new FileNameExtensionFilter("Fichiers XML", "xml");
        fileChooser.setFileFilter(xmlFilter);

        // Définir le répertoire actuel comme répertoire de départ
        fileChooser.setCurrentDirectory(new File("./configs"));

        int userSelection = fileChooser.showOpenDialog(new JFrame());

        if (userSelection == JFileChooser.APPROVE_OPTION) {
            File fileToOpen = fileChooser.getSelectedFile();
            return fileToOpen.getAbsolutePath();
        }
        return null;
    }
}

