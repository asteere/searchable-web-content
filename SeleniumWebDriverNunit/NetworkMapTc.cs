using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Support.Extensions;
using OpenQA.Selenium.Support.UI;
using System.Threading;

namespace SeleniumWebDriverNunit
{
    [TestFixture]
    public class NetworkMapTc : AbstractGuidedHelpTc
    {
        [TestFixtureSetUp]
        public override void SetUpTestFixture()
        {
            const String url = @"/NetworkMap/html/NetworkMap.html";
            const String title = @"Network Map";
            ExpectedValues.Create(BaseUrl, url, title);

            Driver = new FirefoxDriver();

            Driver.Navigate().GoToUrl(ExpectedValues.Instance.FullUrl);
        }

        [Test]
        public void NetworkMapRegression()
        {
            WaitForElementToBeVisible("nwCanvasDiv");

            // Verify - Test that page loaded
            // Verify - Check number of devices
            // Verify - all devices have tool tips
            // Verify - all tool tips have a more button
            
        }

        protected void WaitForElementToBeVisible(String id)
        {
            WebDriverWait wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id)));
        }
    }
}

