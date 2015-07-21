using System;

namespace SeleniumWebDriverNunit
{
    public class ExpectedValues
    {
        // Joel: max height and width for an image 
        public const int TextDivHeight = 400; // TODO: What should this be?

        public bool IsTestingArticle;

        public readonly String BaseUrl;
        public readonly String GuidedHelpUrl;

        public const String DefaultIntroState = @"IntroductionState";
        public readonly String IntroState;

        public String FullUrl
        {
            get { return BaseUrl + GuidedHelpUrl; }
        }
        
        public readonly String Title;

        // The code has been written to ignore failed asserts from the Test-Data folder
        // TODO: Add missing tests of the test folder
        public bool IsTestingTheTestFramework
        {
            get { return GuidedHelpUrl.Contains("Test-Data"); }
        }

        public static ExpectedValues Instance;

        public static ExpectedValues Create(String baseUrl, String partialUrl, String title, bool isArticle = true,
            String introState = DefaultIntroState)
        {
            Instance = new ExpectedValues(baseUrl, partialUrl, title, introState, isArticle);

            return Instance;
        }

        private ExpectedValues(String baseUrl, String partialUrl, String title, String introState = DefaultIntroState, bool isArticle = true)
        {
            BaseUrl = baseUrl;
            GuidedHelpUrl = partialUrl;

            Title = title;
            IsTestingArticle = isArticle;

            IntroState = introState;
        }
    }
}