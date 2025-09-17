using System;
using System.Collections.Generic;
using System.Linq;
using quiz_app.Models.Dto;

namespace quiz_app.Services
{
    public interface IFakeQuestionGenerator
    {
        List<GeneratedQuestionDto> Generate(string topic, string difficulty, int count);
        List<GeneratedQuestionDto> GenerateByRound(int round, int count, string? difficulty = null, string? topic = null);
    }

    public class FakeQuestionGenerator : IFakeQuestionGenerator
    {
        private readonly Random _rng = new();

        private record McqSeed(string Text, string Correct, string[] Options);
        private static string[] Opt(params string[] xs) => xs;

        private static readonly string[] PoolDrinks  = { "Te", "Kaffe", "Mjölk", "Vatten", "Juice" };
        private static readonly string[] PoolFruits  = { "Äpple", "Banan", "Apelsin", "Päron", "Druvor", "Jordgubbe", "Kiwi" };
        private static readonly string[] PoolClothes = { "Regnjacka", "Jacka", "Kappa", "T-shirt", "Mössa", "Byxor" };
        private static readonly string[] PoolWeather = { "Sol", "Regn", "Snö", "Åska", "Vind" };
        private static readonly string[] PoolFeelPos = { "Glädje", "Lugn", "Hopp", "Styrka", "Tillit", "Tacksamhet", "Nyfikenhet" };
        private static readonly string[] PoolEveryday= { "Bok", "Film", "Penna", "Gitarr", "Klocka", "Kalender", "Glas", "Vatten", "Tallrik", "Stol", "Sked" };

        private static readonly List<McqSeed> ComfortPack = new()
        {
            new("Vilken av dessa drycker innehåller oftast koffein?", "Te",      Opt("Apelsinjuice","Vatten","Te","Mjölk")),
            new("Vad är sushi traditionellt inlindad i?",             "Sjögräs", Opt("Sjögräs","Sallad","Rispapper","Plast")),
            new("Vilket av följande är ett vanligt sätt att minska stress?", "Lyssna på lugn musik", Opt("Lyssna på lugn musik","Äta mer socker","Hoppa över sömn","Bråka på nätet")),
            new("Vad producerar bin?",                                "Honung",  Opt("Honung","Smör","Olja","Mjölk")),
            new("Vilken av dessa räknas som en frukt?",               "Äpple",   Opt("Äpple","Sallad","Morot","Broccoli")),
            new("Vilket land är känt för Eiffeltornet?",              "Frankrike", Opt("Frankrike","Italien","Tyskland","Spanien")),
            new("Vad använder du för att skicka ett e-postmeddelande?","Dator",  Opt("Dator","Mikrovågsugn","TV","Ugn")),
            new("Vad hjälper växter att växa?",                       "Solljus", Opt("Solljus","Mörker","Plast","Rök")),
            new("Vilken av dessa är ett musikinstrument?",            "Gitarr",  Opt("Gitarr","Tallrik","Stol","Sked")),
            new("Vilken är en vanlig frukosträtt?",                   "Flingor", Opt("Flingor","Pizza","Biff","Popcorn")),

            new("Vilken färg har himlen en klar dag?",                "Blå",     Opt("Blå","Grön","Röd","Gul")),
            new("Vilket av dessa djur kan flyga?",                    "Fågel",   Opt("Hund","Elefant","Fågel","Orm")),
            new("Hur många ben har en spindel?",                      "Åtta",    Opt("Sex","Åtta","Tio","Fyra")),
            new("Vilket sinne använder vi för att höra?",             "Hörsel",  Opt("Syn","Smak","Hörsel","Känsel")),
            new("Vad andas vi in för att överleva?",                  "Syre",    Opt("Syre","Helium","Kol","Rök")),
            new("Vad växer på träd och byter färg på hösten?",        "Löv",     Opt("Rötter","Löv","Grener","Frukt")),
            new("Vilket av dessa är en form?",                        "Cirkel",  Opt("Cirkel","Blå","Mjuk","Lång")),
            new("Vad använder vi för att skriva?",                    "Blyertspenna", Opt("Gaffel","Blyertspenna","Kniv","Pensel")),
            new("Vad kallas fruset vatten?",                          "Is",      Opt("Ånga","Regn","Is","Dimma")),
            new("Vilket av dessa är ett husdjur?",                    "Hund",    Opt("Lejon","Elefant","Hund","Val")),

            new("Vad absorberar träd från luften?",                   "Koldioxid", Opt("Koldioxid","Syre","Väte","Kväve")),
            new("Vilken färg får du om du blandar rött och blått?",   "Lila",    Opt("Lila","Grön","Orange","Gul")),
            new("Vad är Japans huvudstad?",                           "Tokyo",   Opt("Tokyo","Peking","Seoul","Bangkok")),
            new("Vilket djur är känt för att ha en snabel?",          "Elefant", Opt("Elefant","Lejon","Krokodil","Giraff")),
            new("Vilket av dessa är ett hälsosamt mellanmål?",        "Äppelskivor", Opt("Äppelskivor","Godis","Pommes","Läsk")),
            new("Vad är is gjort av?",                                "Fruset vatten", Opt("Fruset vatten","Salt","Glas","Plast")),
            new("Vad använder vi våra öron till?",                    "Hörsel",  Opt("Hörsel","Lukt","Syn","Smak")),
            new("Vilken av dessa är en planet i vårt solsystem?",     "Mars",    Opt("Mars","Alpha Centauri","Orion","Andromeda")),
            new("Vad är 10 + 5?",                                     "15",      Opt("15","20","25","30")),
            new("Vilken av dessa används för att skriva?",            "Penna",   Opt("Penna","Gaffel","Hammare","Sked")),

            new("Vilket objekt kretsar runt jorden?",                 "Månen",   Opt("Solen","Månen","Moln","Stjärna")),
            new("Vad behöver växter för att växa?",                   "Solljus", Opt("Socker","Solljus","Salt","Papper")),
            new("Vilken av dessa är en riktig planet?",               "Jorden",  Opt("Krypton","Jorden","Atlantis","Neverland")),
            new("Vad har astronauter på sig?",                        "Rymddräkt", Opt("Rymddräkt","Regnjacka","Labrock","Smoking")),
            new("Vad händer när is smälter?",                         "Den blir till vatten", Opt("Den flyter","Den blir till vatten","Den försvinner","Den växer")),
            new("Vad drar saker ner mot marken?",                     "Gravitation", Opt("Luft","Gravitation","Vind","Värme")),
            new("Vilken av dessa är en vätska?",                      "Vatten",  Opt("Sten","Vatten","Trä","Bomull")),
            new("Vilken av dessa kan du se igenom?",                  "Glas",    Opt("Metall","Papper","Glas","Tegel")),
            new("Vilken av dessa skapas av blixtar?",                 "Åska",    Opt("Eld","Snö","Åska","Regn")),
            new("Vad förvandlas larver till?",                        "Fjärilar", Opt("Bin","Spindlar","Fjärilar","Flugor")),

            new("Vad kallar man en berättelse som inte är sann?",     "Fiktion", Opt("Biografi","Fiktion","Historia","Fakta")),
            new("Vilken av dessa hjälper dig att vakna på morgonen?", "Väckarklocka", Opt("Ficklampa","Väckarklocka","Kalender","Spegel")),
            new("Vilken av dessa är en känsla?",                      "Glädje",  Opt("Glädje","Bord","Papper","Fönster")),
            new("Vad gör du när du är trött?",                        "Sover",   Opt("Hoppar","Springer","Sover","Dansar")),
            new("Vilket djur är påhittat?",                           "Drake",   Opt("Häst","Drake","Katt","Får")),
            new("Vilket verktyg talar om vilken dag det är?",         "Kalender", Opt("Klocka","Termometer","Kalender","Linjal")),
            new("Vad har du på dig när det regnar?",                  "Regnjacka", Opt("Gympaskor","Regnjacka","Solglasögon","Handskar")),
            new("Vilket av dessa är ett vänligt ord?",                "Glad",    Opt("Elak","Glad","Arg","Oartig")),
            new("Vilken plats är magisk i sagor?",                    "Slott",   Opt("Livsmedelsbutik","Bibliotek","Slott","Garage")),
            new("Vilken används för att berätta en historia med bilder?", "Film", Opt("Sång","Bok","Film","Pussel")),
        };

        private static readonly string[] CalmActivities   = { "Andas lugnt","Ta en promenad","Lyssna på lugn musik","Dricka te","Sträcka på sig","Skriva dagbok","Meditera","Titta ut genom fönstret" };
        private static readonly string[] NotCalmActivities= { "Bråka","Skrika","Skrolla argt","Hoppa över sömn","Dricka för mycket kaffe","Spela väldigt högt","Stressa" };
        private static readonly string[] KindWords        = { "Snäll", "Varm", "Glad", "Mjuk", "Tacksam" };
        private static readonly string[] NotKindWords     = { "Elak", "Hård", "Oartig", "Arg", "Kall" };
        private static readonly string[] SelfCare         = { "Dricka vatten","Ta en paus","Gå ut en stund","Säga nej","Be om hjälp","Sträcka på kroppen","Byta miljö","Sätta en timer" };
        private static readonly string[] Morning          = { "Borsta tänderna","Äta frukost","Sträcka på sig","Dricka vatten","Kolla kalendern","Andas djupt" };
        private static readonly string[] ColorsCalm       = { "Blå", "Grön", "Ljusgrå" };
        private static readonly string[] ColorsOther      = { "Röd", "Gul", "Orange", "Lila" };


        public List<GeneratedQuestionDto> Generate(string topic, string difficulty, int count)
        {
            var norm = NormalizeDifficulty(difficulty);
            var list = new List<GeneratedQuestionDto>();
            var seen = new HashSet<string>(StringComparer.Ordinal);

            var useComfort =
                string.Equals(topic, "round1",   StringComparison.OrdinalIgnoreCase) ||
                string.Equals(topic, "comfort",  StringComparison.OrdinalIgnoreCase) ||
                string.Equals(topic, "allmän",   StringComparison.OrdinalIgnoreCase) ||
                string.Equals(topic, "allmanna", StringComparison.OrdinalIgnoreCase);

            if (useComfort)
            {
                var shuffled = ComfortPack.OrderBy(_ => _rng.Next()).ToList();

                foreach (var seed in shuffled)
                {
                    if (list.Count >= count) break;
                    var variant = MakeVariant(seed, norm);
                    if (variant != null && seen.Add(variant.Text))
                        list.Add(variant);
                }

                foreach (var s in shuffled)
                {
                    if (list.Count >= count) break;
                    var f = FromSeed(s, norm);
                    if (seen.Add(f.Text)) list.Add(f);
                }
                if (list.Count < count)
                    BackfillWithComfortVariants(list, seen, count, norm);

                return list.OrderBy(_ => _rng.Next()).Take(count).ToList();
            }

            int guard = 0;
            while (list.Count < count && guard++ < count * 120)
            {
                var q = ComposeGentle(norm, topic);
                if (q != null && seen.Add(q.Text))
                    list.Add(q);
            }

            if (list.Count < count)
                BackfillWithComfortVariants(list, seen, count, norm);

            return list.OrderBy(_ => _rng.Next()).Take(count).ToList();
        }

        public List<GeneratedQuestionDto> GenerateByRound(int round, int count, string? difficulty = null, string? topic = null)
        {
            var norm = NormalizeDifficulty(difficulty ?? "easy");
            if (round <= 1)
                return Generate("round1", norm, count);

            var list = new List<GeneratedQuestionDto>();
            var seen = new HashSet<string>(StringComparer.Ordinal);
            int guard = 0;

            while (list.Count < count && guard++ < count * 140)
            {
                var q = round switch
                {
                    2 => ComposeFromTheme("vardag",     norm),
                    3 => ComposeFromTheme("känslor",    norm),
                    4 => ComposeFromTheme("självomsorg",norm),
                    _ => ComposeFromTheme("reflektion", norm)
                };
                if (q != null && seen.Add(q.Text))
                    list.Add(q);
            }

            if (list.Count < count)
                BackfillWithComfortVariants(list, seen, count, norm);

            return list.OrderBy(_ => _rng.Next()).Take(count).ToList();
        }

        private GeneratedQuestionDto? ComposeGentle(string normDiff, string? topic)
        {
            var t = (topic ?? "").Trim().ToLowerInvariant();
            if (t.Contains("känsl"))                          return ComposeFromTheme("känslor",     normDiff);
            if (t.Contains("själv") || t.Contains("omsorg"))  return ComposeFromTheme("självomsorg", normDiff);
            if (t.Contains("vardag"))                         return ComposeFromTheme("vardag",      normDiff);
            return ComposeFromTheme("reflektion", normDiff);
        }

        private GeneratedQuestionDto? ComposeFromTheme(string theme, string normDiff)
        {
            var pick = _rng.Next(5);
            return theme switch
            {
                "vardag" => pick switch
                {
                    0 => BuildFromLists("Vilken av dessa är en frukt?", PoolFruits, PoolEveryday),
                    1 => BuildFromLists("Vad dricker du oftast till frukost?", new[] { "Vatten", "Te", "Juice", "Mjölk" }, new[] { "Soppa", "Sås", "Olja", "Socker" }),
                    2 => BuildFromLists("Vilket plagg passar vid regn?", new[] { "Regnjacka" }, PoolClothes),
                    3 => BuildFromLists("Vilken färg upplevs ofta lugn?", ColorsCalm, ColorsOther),
                    _ => BuildFromLists("Vad använder du för att skriva?", new[] { "Penna" }, new[] { "Gaffel", "Hammare", "Sked" })
                },

                "känslor" => pick switch
                {
                    0 => BuildFromLists("Vilket ord känns vänligast?", KindWords, NotKindWords),
                    1 => BuildFromLists("Vilken känsla är positiv?",   PoolFeelPos, new[] { "Ilska", "Oro", "Stress", "Trötthet" }),
                    2 => BuildFromLists("Vilket ord ger ett lugnt intryck?", new[] { "Lugn" }, new[] { "Upprörd", "Irriterad", "Pressad" }),
                    3 => BuildFromLists("Vilket ord kan lyfta din dag?", new[] { "Tacksamhet", "Hopp" }, new[] { "Cynism", "Förtvivlan", "Likgiltighet" }),
                    _ => BuildFromLists("Vilket ord är mjukt?", new[] { "Mjuk" }, new[] { "Hård", "Vass", "Kantig" })
                },

                "självomsorg" => pick switch
                {
                    0 => BuildFromLists("Vilken handling bryr sig om dig själv?", SelfCare, NotCalmActivities),
                    1 => BuildFromLists("Vad kan hjälpa dig att varva ner?",      CalmActivities, NotCalmActivities),
                    2 => BuildFromLists("Vad är ett snällt val just nu?",         SelfCare, new[] { "Skjuta upp allt", "Strunta i vila", "Överjobba" }),
                    3 => BuildFromLists("Vad kan du göra på morgonen för att må bättre?", Morning, new[] { "Hoppa över frukost", "Stressa extra", "Skippa sömn" }),
                    _ => BuildFromLists("Vilken liten sak kan ge energi?", new[] { "Dricka vatten", "Ta en kort paus" }, new[] { "Skrolla sent", "Skippa paus" })
                },

                _ => pick switch
                {
                    0 => BuildFromLists("Vad känns mest hjälpsamt just nu?", SelfCare, NotCalmActivities),
                    1 => BuildFromLists("Vilket ord vill du bära med dig idag?", KindWords, NotKindWords),
                    2 => BuildFromLists("Vilken aktivitet känns lugn?",         CalmActivities, NotCalmActivities),
                    3 => BuildFromLists("Vilket val är mjukt mot dig?",         SelfCare, new[] { "Pressa hårdare", "Ignorera behov", "Jämföra sig" }),
                    _ => BuildFromLists("Vilken färg känns rofylld?",           ColorsCalm, ColorsOther)
                }
            } is GeneratedQuestionDto dto
              ? WithMeta(dto, theme, normDiff)
              : null;
        }

        private GeneratedQuestionDto BuildFromLists(string stem, IEnumerable<string> correctPool, IEnumerable<string> otherPool)
        {
            var correct = PickOne(correctPool);
            var options = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { TrimOpt(correct) };

            var others = otherPool.ToList();
            int guard = 0;
            while (options.Count < 4 && guard++ < 50)
            {
                var cand = TrimOpt(PickOne(others));
                if (cand.Equals(correct, StringComparison.OrdinalIgnoreCase)) continue;
                if (cand.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > 3) continue;
                options.Add(cand);
            }

            if (options.Count < 2)
            {
                while (options.Count < 2) options.Add("—");
            }

            var list = options.ToList();
            list = list.OrderBy(_ => _rng.Next()).ToList();
            var idx = list.FindIndex(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase));
            if (idx < 0)
            {
                if (list.Count == 4) list[0] = TrimOpt(correct);
                else list.Insert(0, TrimOpt(correct));
                list = list.OrderBy(_ => _rng.Next()).ToList();
                idx = list.FindIndex(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase));
            }
            var variedStem = ClampStem(VaryStem(stem));

            return new GeneratedQuestionDto
            {
                Text = variedStem,
                Type = "mcq",
                Options = list.ToArray(),
                CorrectIndex = idx,
                CorrectAnswer = list[idx],
                Topic = "auto",
                Difficulty = "easy",
                Source = "api",
                GeneratedAt = DateTime.UtcNow
            };
        }
        private string VaryStem(string stem)
        {
            var s = (stem ?? "").Trim();
            if (s.Length == 0) return s;

            var forms = new[]
            {
                s,
                s.Replace("Vilken av dessa", "Vilket av följande"),
                s.Replace("Vilken av dessa", "Vilket av detta"),
                s.Replace("Vad", "Vilket"),
                s.Replace("Vilket", "Vad"),
                s.EndsWith("?") ? "Välj det bästa alternativet: " + s : "Välj det bästa alternativet: " + s + "?",
                s.EndsWith("?") ? "Snabb fråga: " + s : "Snabb fråga: " + s + "?",
                s.EndsWith("?") ? "Vad tycker du – " + s[..^1] + "?" : "Vad tycker du – " + s + "?"
            }
            .Select(x => x.Trim())
            .Where(x => x.Length > 0)
            .Distinct(StringComparer.Ordinal)
            .ToArray();

            return forms.Length == 0 ? s : forms[_rng.Next(forms.Length)];
        }

        private void BackfillWithComfortVariants(List<GeneratedQuestionDto> list, HashSet<string> seen, int targetCount, string norm)
        {
            if (list.Count >= targetCount) return;

            var shuffled = ComfortPack.OrderBy(_ => _rng.Next()).ToList();

            foreach (var s in shuffled)
            {
                if (list.Count >= targetCount) break;
                var v = MakeVariant(s, norm);
                if (v != null && seen.Add(v.Text))
                    list.Add(v);
            }

            foreach (var s in shuffled)
            {
                if (list.Count >= targetCount) break;
                var f = FromSeed(s, norm);
                if (seen.Add(f.Text))
                    list.Add(f);
            }
        }

        private GeneratedQuestionDto WithMeta(GeneratedQuestionDto dto, string theme, string normDiff)
        {
            dto.Topic = theme;
            dto.Difficulty = normDiff;
            dto.Text = ClampStem(dto.Text);
            return dto;
        }

        private string PickOne(IEnumerable<string> src)
        {
            var arr = src as string[] ?? src.ToArray();
            return arr.Length == 0 ? "—" : arr[_rng.Next(arr.Length)];
        }

        private GeneratedQuestionDto? MakeVariant(McqSeed s, string normDiff)
        {
            var stem = ParaphraseShort(s.Text);
            stem = ClampStem(stem);
            var (opts, correctIdx) = RemixOptions(s.Correct, s.Options);
            if (opts is null) return null;

            return new GeneratedQuestionDto
            {
                Text = stem,
                Type = "mcq",
                Options = opts,
                CorrectIndex = correctIdx,
                CorrectAnswer = opts[correctIdx],
                Topic = "comfort",
                Difficulty = normDiff,
                Source = "api",
                GeneratedAt = DateTime.UtcNow
            };
        }

        private GeneratedQuestionDto FromSeed(McqSeed s, string normDiff)
        {
            var (opts, correctIdx) = NormalizeOptions(s.Correct, s.Options);
            return new GeneratedQuestionDto
            {
                Text = ClampStem(s.Text),
                Type = "mcq",
                Options = opts,
                CorrectIndex = correctIdx,
                CorrectAnswer = opts[correctIdx],
                Topic = "comfort",
                Difficulty = normDiff,
                Source = "api",
                GeneratedAt = DateTime.UtcNow
            };
        }

        private static string ClampStem(string text)
        {
            var t = (text ?? "").Trim();
            if (t.Length <= 80) return t;
            return t[..80].TrimEnd(' ', ',', '.', '!', '?') + "…";
        }

        private string ParaphraseShort(string stem)
        {
            var forms = new[]
            {
                stem,
                ReplaceOnce(stem, "Vilken av dessa", "Vilket av detta"),
                ReplaceOnce(stem, "Vilken av dessa", "Vilket av följande"),
                ReplaceOnce(stem, "Vad", "Vilket"),
                ReplaceOnce(stem, "Vilket", "Vad"),
                ReplaceOnce(stem, "Vad använder vi", "Vad använder du"),
                ReplaceOnce(stem, "Vad har du på dig", "Vilket plagg vid regn"),
                ReplaceOnce(stem, "Vad producerar", "Vad gör"),
                ReplaceOnce(stem, "Vilken är", "Vad är"),
                ReplaceOnce(stem, "Vilken av dessa är en", "Vilket är ett exempel på en"),
            }.Where(s => !string.IsNullOrWhiteSpace(s))
             .Select(s => s.Trim())
             .Distinct()
             .ToArray();

            return forms[_rng.Next(forms.Length)];
        }

        private static string ReplaceOnce(string s, string a, string b)
        {
            var i = s.IndexOf(a, StringComparison.Ordinal);
            return i < 0 ? s : s[..i] + b + s[(i + a.Length)..];
        }

        private (string[]? opts, int correctIdx) RemixOptions(string correct, string[] original)
        {
            var pool = PickPoolFor(correct, original);
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { TrimOpt(correct) };

            int guard = 0;
            while (set.Count < 4 && guard++ < 20)
            {
                var cand = TrimOpt(pool[_rng.Next(pool.Length)]);
                if (string.Equals(cand, correct, StringComparison.OrdinalIgnoreCase)) continue;
                if (cand.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > 3) continue;
                set.Add(cand);
            }

            foreach (var o in original.OrderBy(_ => _rng.Next()))
            {
                if (set.Count >= 4) break;
                var cand = TrimOpt(o);
                if (cand.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > 3) continue;
                set.Add(cand);
            }

            if (set.Count < 2) return (null, -1);

            var list = set.ToList();
            if (list.Count >= 4) list = list.Take(4).ToList();

            list = list.OrderBy(_ => _rng.Next()).ToList();
            var idx = list.FindIndex(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase));
            if (idx < 0)
            {
                if (list.Count == 4) list[0] = TrimOpt(correct);
                else list.Insert(0, TrimOpt(correct));
                list = list.OrderBy(_ => _rng.Next()).ToList();
                idx = list.FindIndex(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase));
            }
            return (list.ToArray(), idx);
        }

        private (string[] opts, int correctIdx) NormalizeOptions(string correct, string[] options)
        {
            var clean = options
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(TrimOpt)
                .Where(x => x.Length > 0 && x.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length <= 3)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (!clean.Any(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase)))
                clean.Insert(0, TrimOpt(correct));

            while (clean.Count < 4)
            {
                var pool = PickPoolFor(correct, options);
                var cand = TrimOpt(pool[_rng.Next(pool.Length)]);
                if (!clean.Contains(cand, StringComparer.OrdinalIgnoreCase) &&
                    !cand.Equals(correct, StringComparison.OrdinalIgnoreCase))
                    clean.Add(cand);
                if (clean.Count > 8) break;
            }

            var picked = clean.OrderBy(_ => _rng.Next()).Take(Math.Min(4, clean.Count)).ToList();
            var idx = picked.FindIndex(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase));
            if (idx < 0)
            {
                if (picked.Count == 4) picked[0] = TrimOpt(correct);
                else picked.Insert(0, TrimOpt(correct));
                picked = picked.OrderBy(_ => _rng.Next()).ToList();
                idx = picked.FindIndex(x => x.Equals(correct, StringComparison.OrdinalIgnoreCase));
            }
            return (picked.ToArray(), idx);
        }

        private static string TrimOpt(string s) =>
            (s ?? "").Trim().Replace("  ", " ");

        private string[] PickPoolFor(string correct, string[] options)
        {
            var all = string.Join(" ", options.Append(correct)).ToLowerInvariant();
            if (all.Contains("te") || all.Contains("kaffe") || all.Contains("mjölk") || all.Contains("juice"))
                return PoolDrinks;
            if (all.Contains("äpple") || all.Contains("banan") || all.Contains("frukt"))
                return PoolFruits;
            if (all.Contains("jacka") || all.Contains("regn") || all.Contains("plagg"))
                return PoolClothes;
            if (all.Contains("sol") || all.Contains("regn") || all.Contains("åska"))
                return PoolWeather;
            if (all.Contains("glädje") || all.Contains("lugn") || all.Contains("hopp"))
                return PoolFeelPos;
            return PoolEveryday;
        }

        private static string NormalizeDifficulty(string d)
        {
            var x = (d ?? "").Trim().ToLowerInvariant();
            return x switch
            {
                "lätt" or "easy"                 => "easy",
                "medel" or "medium" or "normal"  => "medium",
                "svår" or "hard"                 => "hard",
                _                                => "easy"
            };
        }
    }
}
