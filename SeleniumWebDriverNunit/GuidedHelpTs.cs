using NUnit.Framework;
using NUnit.Core;

namespace SeleniumWebDriverNunit
{
    public class GuidedHelpTs
    {
        [Suite] public static TestSuite Suite
        {
            get
            {
                // Incomplete instructions on how to set this up
                // 1. Download Firefox and Selenium IDE
                // 2. Selenium WebDriver
                // 
                // https://www.youtube.com/watch?v=CxDkRJ1iHwE
                // https://www.youtube.com/watch?v=2ac4hKSfQ9s
                TestSuite suite = new TestSuite("GuidedArticleTestSuite");
                suite.Add(new GuidedArticleLayoutTc());
                suite.Add(new BoundaryConditionsTc());
                suite.Add(new GuidedContentLayoutTc());
                suite.Add(new GuidedArticleTc());
                suite.Add(new NetworkMapTc());
                return suite;
            }
        }
    }
}
