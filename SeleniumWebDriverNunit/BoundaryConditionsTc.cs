using System;
using System.Threading;
using NUnit.Framework;
using OpenQA.Selenium;

namespace SeleniumWebDriverNunit
{
    // TODO:
    // Verify - test that a overlay-image w/o a background-image
    class BoundaryConditionsTc : AbstractGuidedHelpTc
    {
        private const String ErrorMsg = @"Invalid exception message, did test framework or the templates change";

        [TestFixtureSetUp]
        public override void SetUpTestFixture()
        {
            const String url = @"/GuidedHelp/Test-Data/TestBoundaryArticle.html";
            const String title = @"Test Boundary Article";
            ExpectedValues.Create(BaseUrl, url, title);

            PerformBasicChecks = false;

            base.SetUpTestFixture();

            // The data-ng-init introState is bogus so set the currentState to the first one
            CurrentState = Driver.FindElement(By.Id(ExpectedValues.DefaultIntroState));
            Console.WriteLine("currentStateId=" + CurrentStateId + " active=" + CurrentState.GetAttribute("style"));

            Thread.Sleep(5000);
        }

        [Test]
        public void GoToInvalidStateDetected()
        {
            GoToIntroductionState();

            ValidateStateVisibility();

            String selector = "#" + CurrentStateId + " ." + GuidedHelpConstants.ButtonStyle;
            Console.WriteLine("selector=" + selector);
            IWebElement anchor = Driver.FindElement(By.CssSelector(selector));
            anchor.Click();

            try
            {
                FindCurrentState();
            }
            catch (AssertionException ae)
            {
                Assert.True(ae.Message.Contains(FailedToFindCurrentStateErrorMsg), ErrorMsg);
                return;
            }
            Assert.Fail("Found state that is supposed to not be there");
        }


        [Test]
        public void TitleWrongDetected()
        {
            try
            {
                ValidateHead();
            }
            catch (AssertionException ae)
            {
                Assert.True(ae.Message.Contains(IncorrectTitleErrorMsg), ErrorMsg);
                return;
            }
            Assert.Fail("Invalid or missing title not detected");
        }

        [Test]
        public void InvalidIntroStateInDataNgInitDetected()
        {
            try
            {
                ValidateIntroState();
            }
            catch (AssertionException ae)
            {
                Assert.True(ae.Message.Contains(UnexpectedIntroErrorMsg), ErrorMsg);
                return;
            }
            Assert.Fail("Invalid or missing introState not detected");
        }

        [Test]
        public void MissingArticleBoolInDataNgInitDetected()
        {
            try
            {
                ValidateIsArticle();
            }
            catch (AssertionException ae)
            {
                Assert.True(ae.Message.Contains(BadIsArticleErrorMsg), ErrorMsg);
                return;
            }
            Assert.Fail("Missing IsArticle Bool In DataNgInit");
        }

        [Test]
        public void TextTooBigDetected()
        {
            GoToIntroductionState();

            try
            {
                ValidateNoScroll(GuidedHelpConstants.TextClass);
            }
            catch (AssertionException ae)
            {
                Console.WriteLine("Text to Big:" + ae.Message);
                Assert.True(ae.Message.Contains(MakeAssertMsg(GuidedHelpConstants.TextClass, CurrentStateId)), ErrorMsg);
                return;
            }
            Assert.Fail("Text Too Big test scrollbar not detected");
        }

        [Test]
        public void ImageHeightTooBigScaled()
        {
            GoToIntroductionState();

            try
            {
                ValidateNoScroll(GuidedHelpConstants.DiagramWrapClass);
                Assert.Fail("scrollbar not detected for an image that is supposed to be too large");
            }
            catch (AssertionException ae)
            {
                Assert.True(ae.Message.Contains(MaxHeightMsgPrefix), "Incorrect exception received");
                Assert.True(ae.Message.Contains(MakeAssertMsg(GuidedHelpConstants.DiagramWrapClass, CurrentStateId)), "Incorrect exception received");
            }
            
        }

        private void GoToIntroductionState()
        {
            if (!Driver.Url.Contains(ExpectedValues.DefaultIntroState))
            {
                Driver.Navigate().GoToUrl(ExpectedValues.Instance.FullUrl + "#/" + ExpectedValues.DefaultIntroState);
            }
        }

    }
}
