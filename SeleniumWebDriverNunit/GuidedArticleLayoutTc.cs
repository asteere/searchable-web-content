using System;
using System.Collections.Generic;
using System.Threading;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace SeleniumWebDriverNunit
{
    [TestFixture]
    public class GuidedArticleLayoutTc : AbstractGuidedHelpTc
    {
        [TestFixtureSetUp]
        public override void SetUpTestFixture()
        {
            const String url = @"/GuidedHelp/005FFABC-4290-43B9-8ECE-A369005EAE9B/GuidedArticleStates.html";
            const String title = @"DISH Network Hopper: Troubleshoot Network Connection";
            ExpectedValues.Create(BaseUrl, url, title);

            base.SetUpTestFixture();
        }

        // TODO: remove this once we have state validation complete
        [Test]
        public void CanvasSizeIsCorrect()
        {
            IList<IWebElement> canvasList = Driver.FindElements(By.CssSelector("canvas"));
            foreach (IWebElement canvas in canvasList)
            {
                IWebElement stateDiv = FindParentStateDiv(canvas);

                CanvasSizeIsCorrect(stateDiv);
            }

        }


        [Test]
        public void SwitchGuidedToScroll()
        {
            // TODO: Is the test order of execution affecting results - images are drawn beforehand
            ValidateOnlyOneStateActive();

            OpenMoreDialog();
            IWebElement scrollRadioButton = Driver.FindElement(By.Id(GuidedHelpConstants.ScrollRadioButtonId));
            scrollRadioButton.Click();
            
            Thread.Sleep(1000);
            ValidateAllStatesActive();

            OpenMoreDialog();
            IWebElement guidedRadioButton = Driver.FindElement(By.Id(GuidedHelpConstants.GuidedRadioButtonId));
            guidedRadioButton.Click();

            Thread.Sleep(1000);
            ValidateOnlyOneStateActive();
        }

        private void ValidateAllStatesActive()
        {
            foreach (IWebElement state in States)
            {
                ExpectedConditions.ElementIsVisible(By.Id(state.GetAttribute("id")));
                ExpectedConditions.ElementIsVisible(By.CssSelector("#" + state.GetAttribute("id") + " canvas"));
            }
        }

        private void ValidateOnlyOneStateActive()
        {
            int activeStates = 0;
            foreach (IWebElement state in States)
            {
                String activeStateId = state.GetAttribute("id");
                By activeStateSelector = By.Id(activeStateId);
                if (state.GetAttribute("id").Equals(CurrentStateId))
                {
                    ExpectedConditions.ElementIsVisible(activeStateSelector);
                    CanvasSizeIsCorrect(state);
                    activeStates++;
                }
                else
                {
                    ExpectedConditions.ElementIsVisible(activeStateSelector);
                }
            }
            Assert.AreEqual(1, activeStates, "Incorrect number of active states");
        }

        [Test]
        public void GuidedArticleLayoutTestCaseTest()
        {
            String selector = "div.Text";

            IWebElement textDiv = Driver.FindElement(By.CssSelector(selector));

            Assert.AreEqual("If your Hopper receiver is having trouble connecting to the Internet because of connectivity problems on your home network, a recent power outage, or some other reason, you may need to reset its connection to the Internet. Follow the solution below to learn how.", textDiv.Text, "Unexpected text");

            int textDivHeight = textDiv.Size.Height;
            // ERROR: Caught exception [ERROR: Unsupported command [getElementHeight | css=div.Text | ]]

            // needs extra items Assert.IsTrue(driver.FindElement(By.CssSelector("div.Text *:nth-child(15)")).Displayed);

            // needs extra items Assert.AreEqual("More8", driver.FindElement(By.CssSelector("div.Text p:nth-child(8)")).Text);

            // Console.WriteLine("textDiv.Size.MaxImageHeight=" + textDiv.Size.MaxImageHeight);

            // TODO: Move this into a FormValidator object (mobile, tablet, laptop, desktop, tv)
            // Given a screen size, validate the width, height, scrollbars are present

            // If there is too much text for the div
            Assert.LessOrEqual(textDivHeight, ExpectedValues.TextDivHeight, "Incorrect height for " + selector);

        }
    }
}
