import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

import java.util.Random;
import java.awt.Color;

import java.io.File;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

@SuppressWarnings("unused")
public class TOOLS_EvolutionRule {

    public String path = "";
    public String fileContent = "";
    public int cursor = 0;

    public TOOLS_EvolutionRule(String path, boolean isPath) {
        if (isPath) {
            this.path = path;
            this.fileContent = readFileContent();
            System.out.println(fileContent);
        } else {
            this.fileContent = path;
        }
    }

    private String readFileContent() {
        StringBuilder content = new StringBuilder();
        try {
            FileReader fileReader = new FileReader(path);
            BufferedReader reader = new BufferedReader(fileReader);
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return content.toString();
    }

    public String parseFile() {
        StringBuilder buffer = new StringBuilder();

        // Vérifiez que 'cursor' et 'fileContent' sont correctement initialisés
        if (cursor < 0 || cursor >= fileContent.length()) {
            return ""; // ou une autre valeur par défaut appropriée
        }

        // Lire les caractères jusqu'à rencontrer un délimiteur
        while (cursor < fileContent.length()) {
            char currentChar = fileContent.charAt(cursor);
            if (currentChar == '(' || currentChar == ')' || currentChar == ',' || currentChar == ' ') {
                cursor++; // passez au caractère suivant pour la prochaine appel
                // Continuer à avancer le curseur si le caractère suivant est également un délimiteur
                while (cursor < fileContent.length() && (fileContent.charAt(cursor) == '(' || fileContent.charAt(cursor) == ')' || fileContent.charAt(cursor) == ',' || fileContent.charAt(cursor) == ' ')) {
                    cursor++;
                }
                break;
            } else {
                buffer.append(currentChar);
            }
            cursor++;
        }
        return buffer.toString();
    }

    public TreeNode createNode(String buffer) {
        if (isNumeric(buffer)) {
            // Create a node with the constant
            return new ConstNode(Integer.parseInt(buffer));
        } else {
            // Create a node with the operator
            switch (buffer) {
                case "ET":
                    return new ET(createNode(parseFile()), createNode(parseFile()));
                case "OU":
                    return new OU(createNode(parseFile()), createNode(parseFile()));
                case "NON":
                    return new NON(createNode(parseFile()));
                case "SUP":
                    return new SUP(createNode(parseFile()), createNode(parseFile()));
                case "SUPEQ":
                    return new SUPEQ(createNode(parseFile()), createNode(parseFile()));
                case "EQ":
                    return new EQ(createNode(parseFile()), createNode(parseFile()));
                case "ADD":
                    return new ADD(createNode(parseFile()), createNode(parseFile()));
                case "SUB":
                    return new SUB(createNode(parseFile()), createNode(parseFile()));
                case "MUL":
                    return new MUL(createNode(parseFile()), createNode(parseFile()));
                case "SI":
                    return new SI(createNode(parseFile()), createNode(parseFile()), createNode(parseFile()));
                case "COMPTER":
                    return new COMPTER(parseFile());
                default:
                    System.out.println("Error: Invalid operator");
                    return null;
            }
        }
    }

    public void setCursor(int cursor) {
        this.cursor = cursor;
    }

    private boolean isNumeric(String buffer) {
        if (buffer == null) {
            return false;
        }
        try {
            int d = Integer.parseInt(buffer);
        } catch (NumberFormatException nfe) {
            return false;
        }
        return true;
    }
}
