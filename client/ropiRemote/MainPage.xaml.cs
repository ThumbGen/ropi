using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text.RegularExpressions;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Storage.Streams;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Media.Imaging;
using Windows.UI.Xaml.Navigation;
using MJPEGDecoderWinRTLib;
using ropiRemote.Annotations;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=391641

namespace ropiRemote
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page, INotifyPropertyChanged
    {
        private readonly MJPEGDecoder decoder = new MJPEGDecoder();
        private BitmapImage cameraBitmap;
        private readonly DispatcherTimer timer = new DispatcherTimer();

        public MainPage()
        {
            this.InitializeComponent();

            this.NavigationCacheMode = NavigationCacheMode.Required;

            Loaded += MainPage_Loaded;
        }

        private async void MainPage_Loaded(object sender, RoutedEventArgs e)
        {
            CameraBitmap = new BitmapImage();

            decoder.ImgDetectionMode = MJPEGDecoder.ImageDetectionMode.BoundaryBased;
            decoder.Error += Decoder_Error;
            
            timer.Interval = TimeSpan.FromSeconds(1);
            timer.Tick += Timer_Tick;
            timer.Start();
        }

        private async void Timer_Tick(object sender, object e)
        {
            timer.Stop();
            try
            {
                var res = await RequestsHelper.SendRequestAsync("get", GetIP(), $"ultrasonic", $"?unique={Guid.NewGuid()}");
                if (res.IsSuccessStatusCode)
                {
                    try
                    {
                        Sonar.Text = string.Empty;
                        var sdist = Regex.Match(await res.Content.ReadAsStringAsync(), "\"dist\": (\\d+)").Groups[1].Value;
                        int dist;
                        if (int.TryParse(sdist, out dist))
                        {
                            if (dist > 50) // more than 50cm is free road
                            {
                                Sonar.Text = "free road";
                            }
                            else
                            {
                                Sonar.Text = dist + " cm";
                            }
                        }
                    }
                    catch { }
                }
            }
            finally
            {
                timer.Start();
            }
        }

        /// <summary>
        /// Invoked when this page is about to be displayed in a Frame.
        /// </summary>
        /// <param name="e">Event data that describes how this page was reached.
        /// This parameter is typically used to configure the page.</param>
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            // TODO: Prepare page for display here.

            // TODO: If your application contains multiple pages, ensure that you are
            // handling the hardware Back button by registering for the
            // Windows.Phone.UI.Input.HardwareButtons.BackPressed event.
            // If you are using the NavigationHelper provided by some templates,
            // this event is handled for you.
        }

        private void Decoder_Error(object sender, ErrorEventArgs e)
        {

        }

        public BitmapImage CameraBitmap
        {
            get { return cameraBitmap; }
            set
            {
                if (Equals(value, cameraBitmap)) return;
                cameraBitmap = value;
                OnPropertyChanged();
            }
        }

        private void OnFrameReady(object sender, FrameReadyEventArgs e)
        {
            Dispatcher.RunAsync(CoreDispatcherPriority.Low, async () =>
                                                                  {
                                                                      using (InMemoryRandomAccessStream ms = new InMemoryRandomAccessStream())
                                                                      {
                                                                          using (DataWriter writer = new DataWriter(ms.GetOutputStreamAt(0)))
                                                                          {
                                                                              writer.WriteBytes(e.FrameBuffer);
                                                                              await writer.StoreAsync();
                                                                          }
                                                                          CameraBitmap.SetSource(ms);
                                                                      }
                                                                  });
        }

        public event PropertyChangedEventHandler PropertyChanged;

        [NotifyPropertyChangedInvocator]
        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private string GetIP()
        {
            return IP?.Text.Trim();
        }

        private void ButtonBase_OnClick(object sender, RoutedEventArgs e)
        {
            var ip = GetIP();
            if (string.IsNullOrWhiteSpace(ip)) return;
            var btn = sender as Button;
            var cmd = btn.Tag.ToString();

            RequestsHelper.SendRequestAsync("put", GetIP(), $"motor/{cmd}");
        }

        private void Speed_OnValueChanged(object sender, RangeBaseValueChangedEventArgs e)
        {
            var ip = GetIP();
            if (string.IsNullOrWhiteSpace(ip)) return;
            if (e.NewValue != e.OldValue)
            {
                RequestsHelper.SendRequestAsync("put", GetIP(), $"motor/speed/{e.NewValue}");
            }
        }

        private void Flash_OnClick(object sender, RoutedEventArgs e)
        {
            var ip = GetIP();
            if (string.IsNullOrWhiteSpace(ip)) return;
            RequestsHelper.SendRequestAsync("put", GetIP(), $"leds/flash");
        }

        private async void ToggleSwitch_OnToggled(object sender, RoutedEventArgs e)
        {
            try
            {
                decoder.FrameReady -= OnFrameReady;
                var ip = GetIP();
                if (string.IsNullOrWhiteSpace(ip)) return;
                if (ToggleSwitch.IsOn)
                {
                    decoder.FrameReady += OnFrameReady;
                    await decoder.ParseStreamAsync($"http://{ip}:8080/stream/video.mjpeg");
                }
                else
                {
                    decoder.StopStream();
                    using (InMemoryRandomAccessStream ms = new InMemoryRandomAccessStream())
                    {
                        CameraBitmap.SetSource(ms);
                    }
                }
            }
            catch { }
        }
    }
}
