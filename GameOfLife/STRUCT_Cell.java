public class STRUCT_Cell
{
    private boolean value;

    public STRUCT_Cell() 
    {
        value = false; // Default value for a cell
    }
    public void setCellValue(boolean value)
    {
        this.value = value; 
    }
    public boolean getCellValue()
    {
        return value;
    }
}