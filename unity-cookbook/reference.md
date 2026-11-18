# Unity Cookbook — Reference v1.0

> גרסת Markdown לגיבוי וקריאה. בממשק HTML אפשר להוסיף הערות אישיות, תמונות ונושאים.

**תוכן:** 34 נושאים, 54 דרכי מימוש.

## איך מוצאים אובייקט בסצנה?

מזהים אובייקט לפי הפניה, שם, Tag, טיפוס קומפוננטה או מזהה עסקי. בוחרים לפי מידת ההיכרות עם האובייקט והאם הוא דינמי.

**קטגוריה:** אובייקטים

### הפניה ישירה מה־Inspector

הבחירה המועדפת כשמכירים מראש את האובייקט.

```csharp
using UnityEngine;
public class DoorController : MonoBehaviour
{
    [SerializeField] private GameObject door;

    public void OpenDoor()
    {
        if (door != null) door.SetActive(false);
    }
}
```

**מתי כדאי:** אין חיפוש בזמן ריצה; עובד גם כש־door כבוי.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SerializeField.html

### GameObject.Find

איתור אובייקט פעיל לפי שם או נתיב בהיררכיה.

```csharp
using UnityEngine;
public class FindByNameDemo : MonoBehaviour
{
    private GameObject player;
    void Start()
    {
        player = GameObject.Find("Player");
        if (player == null) Debug.LogWarning("Player not found");
    }
}
```

**מתי כדאי:** נוח לניסוי מהיר, פחות יציב כשהשם משתנה.

**זהירות:** רק אובייקטים פעילים; לא להשתמש בכל Update.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.Find.html

### GameObject.FindWithTag

איתור אחד מקבוצת אובייקטים בעלי Tag.

```csharp
using UnityEngine;
public class FindByTagDemo : MonoBehaviour
{
    void Start()
    {
        GameObject player = GameObject.FindWithTag("Player");
        if (player != null) Debug.Log(player.name);
    }
}
```

**מתי כדאי:** שימושי לזיהוי תפקיד (Player, MainCamera).

**זהירות:** Tag חייב להיות מוגדר; אם יש כמה התאמות אין הבטחה מי תחזור.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.FindWithTag.html

### GameObject.FindGameObjectsWithTag

איתור כל האובייקטים הפעילים עם Tag נתון.

```csharp
using UnityEngine;
public class FindAllEnemies : MonoBehaviour
{
    void Start()
    {
        GameObject[] enemies = GameObject.FindGameObjectsWithTag("Enemy");
        foreach (GameObject enemy in enemies)
            Debug.Log(enemy.name);
    }
}
```

**מתי כדאי:** מחזיר מערך, ולא GameObject יחיד.

**זהירות:** Tag חייב להיות מוגדר; אינו כולל אובייקטים כבויים.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.FindGameObjectsWithTag.html

### FindAnyObjectByType<T>

מציאת קומפוננטה אחת מהטיפוס המבוקש.

```csharp
using UnityEngine;
public class FindServiceDemo : MonoBehaviour
{
    void Start()
    {
        AudioListener listener = FindAnyObjectByType<AudioListener>();
        if (listener != null) Debug.Log(listener.name);
    }
}
```

**מתי כדאי:** טוב כשמחפשים רכיב לפי התנהגות ולא לפי שם.

**זהירות:** לא מחזיר Prefab Assets; ללא פרמטר לא כולל inactive.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.FindAnyObjectByType.html

### Dictionary<TKey,TValue>

גישה לפי מזהה ייחודי אחרי רישום מראש.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class ObjectRegistry : MonoBehaviour
{
    private readonly Dictionary<string, GameObject> objects = new();

    public void Register(string id, GameObject obj) => objects[id] = obj;
    public GameObject Get(string id)
    {
        return objects.TryGetValue(id, out var obj) && obj != null
            ? obj : null;
    }
}
```

**מתי כדאי:** לשליפה חוזרת ומהירה כשיש מזהה יציב, לא מנגנון Find אוטומטי.

**זהירות:** חובה לבצע רישום ולנקות הפניות אחרי Destroy.

**דגשים חשובים:**

- `GameObject.Find` ו־`FindWithTag` לא מוצאים אובייקט לא פעיל.
- `FindAnyObjectByType` מחפש קומפוננטה, ולא GameObject לפי שם.
- Tag הוא כלי תקין ושימושי לסיווג; הוא פשוט לא מתאים לכל תלות.
- הפניה שכבר נשמרה ממשיכה להיות נגישה גם אחרי `SetActive(false)`; Destroy שונה מהשבתה.
- `FindObjectOfType<T>()` מופיע בחומר ישן אך נחשב Obsolete; החלופות הן `FindFirstObjectByType<T>()` או `FindAnyObjectByType<T>()`. 

**להימנע:** לא לחפש שוב ושוב בתוך Update אם אפשר לשמור הפניה אחת.

**שאלה לביקורת:** יש דלת שתמיד נמצאת בסצנה, אפילו כשהיא כבויה. מה היית בוחר?

## איך מוצאים אובייקט כבוי (Inactive)?

ההבדל הוא בין אובייקט שכובה בסצנה לבין Prefab Asset שלא נטען לסצנה.

**קטגוריה:** אובייקטים

### FindFirstObjectByType<T>(Include)

חיפוש קומפוננטה גם על אובייקטים כבויים.

```csharp
using UnityEngine;
public class FindInactiveDemo : MonoBehaviour
{
    void Start()
    {
        Canvas canvas = FindFirstObjectByType<Canvas>(
            FindObjectsInactive.Include);
        if (canvas != null) Debug.Log(canvas.gameObject.name);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.FindFirstObjectByType.html

### GetComponentInChildren<T>(true)

חיפוש קומפוננטה בהיררכיית הילדים בלבד.

```csharp
using UnityEngine;
public class FindInactiveChild : MonoBehaviour
{
    void Start()
    {
        Renderer found = GetComponentInChildren<Renderer>(true);
        if (found != null) Debug.Log(found.gameObject.name);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Component.GetComponentInChildren.html

### transform.Find("Child")

איתור ילד ישיר לפי שם או נתיב יחסי.

```csharp
using UnityEngine;
public class ChildLookup : MonoBehaviour
{
    void Start()
    {
        Transform child = transform.Find("Panel/CloseButton");
        if (child != null) child.gameObject.SetActive(true);
    }
}
```

**זהירות:** לא מבצע חיפוש רקורסיבי חופשי בלי נתיב.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Transform.Find.html

**דגשים חשובים:**

- `FindObjectsInactive.Include` לא מאפשר לחפש Assets שבתיקיית Project.
- `GetComponentInChildren(true)` כולל ילדים כבויים; האובייקט השורשי עצמו נבדק תמיד.
- `transform.Find` יכול למצוא גם Transform של ילד כבוי.

**שאלה לביקורת:** מדוע GameObject.Find("HiddenPanel") מחזיר null אף שהפאנל קיים ב־Hierarchy?

## איך ניגשים ל־Prefab שלא נמצא בסצנה?

Prefab Asset נמצא ב־Project. כדי ליצור ממנו אובייקט בסצנה צריך לשמור הפניה לנכס או לטעון אותו.

**קטגוריה:** אובייקטים

### SerializeField + Instantiate

קישור הנכס דרך Inspector ויצירת מופע בזמן ריצה.

```csharp
using UnityEngine;
public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;

    public void Spawn()
    {
        if (enemyPrefab != null)
            Instantiate(enemyPrefab, transform.position, Quaternion.identity);
    }
}
```

**מתי כדאי:** ברור, פשוט וללא מחרוזת נתיב.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.Instantiate.html

### Resources.Load<T>

טעינת נכס מתוך תיקיית Resources לפי נתיב.

```csharp
using UnityEngine;
public class ResourcePrefabDemo : MonoBehaviour
{
    void Start()
    {
        GameObject prefab = Resources.Load<GameObject>("Enemies/Slime");
        if (prefab != null) Instantiate(prefab);
    }
}
```

**מתי כדאי:** מתאים לדוגמאות קטנות או מערכות Resources קיימות.

**זהירות:** יש לשים את הנכס ב־Assets/Resources/Enemies/Slime.prefab; במערכות תוכן גדולות שקלו Addressables.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Resources.Load.html

**דגשים חשובים:**

- Prefab Asset איננו GameObject חי בסצנה.
- `GameObject.Find` מחפש אובייקטים בסצנות טעונות ולא קבצים בתיקיית Project.

## איך מקבלים Component?

GameObject הוא מיכל, ו־Components הם ההתנהגויות/הנתונים שמחוברים אליו.

**קטגוריה:** קומפוננטות

### GetComponent<T>

הקומפוננטה נמצאת על אותו אובייקט.

```csharp
using UnityEngine;
public class RigidbodyExample : MonoBehaviour
{
    private Rigidbody rb;
    void Awake() => rb = GetComponent<Rigidbody>();
    void FixedUpdate()
    {
        if (rb != null) rb.AddForce(Vector3.forward);
    }
}
```

**מתי כדאי:** שמור תוצאה במקום לחזור על החיפוש.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Component.GetComponent.html

### TryGetComponent<T>

בדיקה ללא הנחה שהקומפוננטה קיימת.

```csharp
using UnityEngine;
public class OptionalComponentDemo : MonoBehaviour
{
    void Start()
    {
        if (TryGetComponent<Rigidbody>(out var body))
            Debug.Log("Mass: " + body.mass);
    }
}
```

**מתי כדאי:** טוב לרכיב אופציונלי.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.TryGetComponent.html

**דגשים חשובים:**

- `GetComponent<T>()` מחזיר קומפוננטה, לא GameObject; גישה ל־GameObject דרך `component.gameObject`.
- רצוי `RequireComponent` לרכיב חובה, בנוסף לבדיקה לפי הצורך.

## איך מחפשים בילדים או בהורים?

אפשר לצמצם חיפוש לתת־עץ במקום לסרוק את כל הסצנה.

**קטגוריה:** קומפוננטות

### GetComponentsInChildren<T>(true)

מחזיר את כל הקומפוננטות אצלנו ובילדים, כולל כבויים.

```csharp
using UnityEngine;
public class RenderersUnderRoot : MonoBehaviour
{
    void Start()
    {
        Renderer[] renderers = GetComponentsInChildren<Renderer>(true);
        foreach (var renderer in renderers)
            Debug.Log(renderer.name);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Component.GetComponentsInChildren.html

### GetComponentInParent<T>

חיפוש כלפי מעלה להורה בעל הקומפוננטה.

```csharp
using UnityEngine;
public class ChildPart : MonoBehaviour
{
    void Start()
    {
        Rigidbody parentBody = GetComponentInParent<Rigidbody>();
        if (parentBody != null) Debug.Log(parentBody.name);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Component.GetComponentInParent.html

**דגשים חשובים:**

- אל תבלבל בין `Transform.Find` (לפי נתיב) לבין `GetComponentInChildren` (לפי טיפוס).

## איך מפעילים או מכבים אובייקט?

הפעלת GameObject היא מצב של ההיררכיה, לא מחיקה מהסצנה.

**קטגוריה:** אובייקטים

### SetActive(bool)

מפעיל או מכבה את האובייקט מקומית.

```csharp
using UnityEngine;
public class PanelToggle : MonoBehaviour
{
    [SerializeField] private GameObject panel;
    public void Show() { if (panel != null) panel.SetActive(true); }
    public void Hide() { if (panel != null) panel.SetActive(false); }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.SetActive.html

### activeSelf vs activeInHierarchy

בודקים מצב מקומי לעומת מצב אפקטיבי בסצנה.

```csharp
using UnityEngine;
public class ActiveStateExample : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Local: " + gameObject.activeSelf);
        Debug.Log("In hierarchy: " + gameObject.activeInHierarchy);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject-activeInHierarchy.html

**דגשים חשובים:**

- אם ההורה כבוי, `activeSelf` של ילד יכול להיות true אבל `activeInHierarchy` יהיה false.
- `SetActive(false)` שונה מ־`Destroy`: האובייקט נשאר בזיכרון והפניות אליו תקפות.

## איך יוצרים מערך (Array)?

אוסף עם גודל קבוע וגישה באמצעות אינדקס.

**קטגוריה:** מבני נתונים

### מערך טיפוסי

כשמספר האיברים ידוע מראש.

```csharp
using UnityEngine;
public class ArrayDemo : MonoBehaviour
{
    private int[] scores = { 10, 20, 30 };
    void Start()
    {
        Debug.Log(scores[0]);
        for (int i = 0; i < scores.Length; i++)
            Debug.Log(scores[i]);
    }
}
```

**דגשים חשובים:**

- `Length` הוא מספר איברי המערך, ו־`0` האינדקס הראשון.
- Unity יודע לסריאלז מערכים של טיפוסים נתמכים.

## איך עובדים עם List<T>?

רשימה דינמית עם סדר וגישה לפי אינדקס.

**קטגוריה:** מבני נתונים

### Add / Remove / Count

יצירה, הוספה, מחיקה ומעבר על איברים.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class ListDemo : MonoBehaviour
{
    private readonly List<string> names = new();
    void Start()
    {
        names.Add("Avi");
        names.Add("Noa");
        names.Remove("Avi");
        foreach (string name in names) Debug.Log(name);
        Debug.Log("Count: " + names.Count);
    }
}
```

### List ב־Inspector

אפשר למלא רשימה טיפוסית בממשק Unity.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class Waypoints : MonoBehaviour
{
    [SerializeField] private List<Transform> points = new();
    public Transform GetPoint(int index)
    {
        return index >= 0 && index < points.Count ? points[index] : null;
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SerializeField.html

**דגשים חשובים:**

- `List<T>` שומרת סדר ויכולה להכיל כפילויות.
- שימוש ב־`[SerializeField]` תומך ב־List כאשר סוג האיברים נתמך בסריאליזציה.

## איך יוצרים ומשתמשים ב־Dictionary?

מיפוי בין מפתח ייחודי לערך. שימושי לשמירת אובייקטים לפי ID, אבל הוא לא מחפש אוטומטית בסצנה.

**קטגוריה:** מבני נתונים

### Add / TryGetValue / Remove

פעולות הבסיס של מילון.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class DictionaryDemo : MonoBehaviour
{
    private readonly Dictionary<string, int> scores = new();
    void Start()
    {
        scores["Player1"] = 100;
        if (scores.TryGetValue("Player1", out int score))
            Debug.Log(score);
        scores.Remove("Player1");
    }
}
```

### Inspector List → Runtime Dictionary

דרך מקובלת לקשר אובייקטים ידנית ולמפות אותם בזמן ריצה.

```csharp
using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class PanelEntry
{
    public string id;
    public GameObject panel;
}

public class PanelRegistry : MonoBehaviour
{
    [SerializeField] private List<PanelEntry> entries = new();
    private readonly Dictionary<string, GameObject> panels = new();

    void Awake()
    {
        foreach (var entry in entries)
            if (!string.IsNullOrEmpty(entry.id) && entry.panel != null)
                panels[entry.id] = entry.panel;
    }

    public GameObject Get(string id) =>
        panels.TryGetValue(id, out var panel) && panel != null ? panel : null;
}
```

**מתי כדאי:** משלב הגדרה נוחה ב־Inspector עם שליפה מהירה בזמן ריצה.

**זהירות:** מפתח כפול יחליף ערך קודם בשימוש באינדקסר.

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SerializeField.html

**דגשים חשובים:**

- Unity לא מסריאלז ישירות Dictionary רגיל ב־Inspector המובנה.
- `TryGetValue` עדיף על `dict[key]` אם מפתח עשוי לא להתקיים.
- יש לנקות רישום של אובייקטים שנהרסו, במיוחד במערכת דינמית.

**שאלה לביקורת:** האם Dictionary<string, GameObject> יודע למצוא אובייקט שלא הוספנו אליו?

## איך שומרים ערכים בלי כפילויות?

HashSet<T> מיועד לשייכות, לא לסדר או אינדקס.

**קטגוריה:** מבני נתונים

### HashSet Add / Contains / Remove

מניעת כפילויות ובדיקת חברות.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class CollectedKeys : MonoBehaviour
{
    private readonly HashSet<string> keys = new();
    public void Collect(string id) => keys.Add(id);
    public bool HasKey(string id) => keys.Contains(id);
    public void Spend(string id) => keys.Remove(id);
}
```

**דגשים חשובים:**

- אין גישה לפי `set[0]`.
- Unity לא מציג HashSet רגיל ב־Inspector כברירת מחדל.

## איך עובדים עם Stack ו־Queue?

Stack הוא LIFO; Queue הוא FIFO.

**קטגוריה:** מבני נתונים

### Stack<T>

מתאים להיסטוריית מסכים ול־Undo.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class BackStack : MonoBehaviour
{
    private readonly Stack<string> history = new();
    void Start()
    {
        history.Push("Main");
        history.Push("Settings");
        Debug.Log(history.Pop()); // Settings
    }
}
```

### Queue<T>

מתאים לפקודות שמטופלות לפי סדר הגעה.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class ActionQueue : MonoBehaviour
{
    private readonly Queue<string> actions = new();
    void Start()
    {
        actions.Enqueue("Jump");
        actions.Enqueue("Run");
        Debug.Log(actions.Dequeue()); // Jump
    }
}
```

**דגשים חשובים:**

- `Pop`/`Dequeue` על אוסף ריק יזרקו חריגה; אפשר לבדוק `Count > 0`.

## איך יוצרים Enum?

ערכים בעלי שמות ברורים במקום מחרוזות שבירות.

**קטגוריה:** C# יסודות

### Enum + switch

מצבי משחק, סוגי דמויות, מסכים.

```csharp
using UnityEngine;
public enum GameMode { Menu, Playing, Paused }

public class GameModeExample : MonoBehaviour
{
    [SerializeField] private GameMode mode = GameMode.Menu;
    public void PrintMode()
    {
        switch (mode)
        {
            case GameMode.Menu: Debug.Log("Menu"); break;
            case GameMode.Playing: Debug.Log("Playing"); break;
            case GameMode.Paused: Debug.Log("Paused"); break;
        }
    }
}
```

**דגשים חשובים:**

- Enum הוא טיפוס C# רגיל; Unity תומך בהצגתו ב־Inspector.

## איך חושפים שדה ב־Inspector?

[SerializeField] שומר על private ועדיין מאפשר קישור או הגדרה בסצנה.

**קטגוריה:** Unity Editor

### [SerializeField] private

הדרך המקובלת לשדות שמגדירים ב־Editor.

```csharp
using UnityEngine;
public class CharacterConfig : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private Transform target;

    void Update()
    {
        if (target != null)
            transform.position = Vector3.MoveTowards(
                transform.position, target.position, moveSpeed * Time.deltaTime);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SerializeField.html

**דגשים חשובים:**

- `[SerializeField]` הוא עניין של סריאליזציה ולא שינוי נראות מ־private ל־public.
- `readonly` ו־`static` לא עוברים סריאליזציה רגילה של Unity.

## מתי משתמשים ב־Awake, Start, Update?

מפרידים בין השגת הפניות, איתחול ואירועים שחוזרים כל פריים.

**קטגוריה:** מחזור חיים

### Lifecycle

דוגמה מינימלית לקצב ולסדר המשוער ב־MonoBehaviour פעיל.

```csharp
using UnityEngine;
public class LifecycleDemo : MonoBehaviour
{
    void Awake() => Debug.Log("Awake: local references");
    void OnEnable() => Debug.Log("OnEnable: enabled");
    void Start() => Debug.Log("Start: before first Update");
    void Update() { /* each rendered frame */ }
    void FixedUpdate() { /* physics timestep */ }
    void OnDisable() => Debug.Log("OnDisable");
    void OnDestroy() => Debug.Log("OnDestroy");
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.html

**דגשים חשובים:**

- הסדר בין Awake של אובייקטים שונים אינו מובטח בלי הגדרת Script Execution Order/תכנון מפורש.
- לא לבצע חיפוש סצנה בכל Update כשאפשר לאתחל ולשמור הפניה.
- FixedUpdate קשור לצעד פיזיקה, לא לקצב ציור המסך.

## איך קוראים מקלדת או קלט?

דוגמה ל־Input Manager הוותיק. בפרויקטים חדשים אפשר להשתמש בחבילת Input System.

**קטגוריה:** קלט

### Input.GetKeyDown

אירוע מקש יחיד במסגרת ה־Legacy Input API.

```csharp
using UnityEngine;
public class KeyboardDemo : MonoBehaviour
{
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
            Debug.Log("Jump pressed");
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Input.GetKeyDown.html

**דגשים חשובים:**

- כשמשתמשים ב־Input System החדש בלבד, יש להמיר למערכת Actions.
- `GetKeyDown` נבדק בתוך `Update`, לא `FixedUpdate`, כדי לא לפספס אירועי פריים.

## איך יוצרים אובייקט בזמן ריצה?

Instantiate יוצר עותק מסצנה או מ־Prefab. כדאי לשמור את ההפניה לעותק שנוצר.

**קטגוריה:** אובייקטים

### Instantiate(prefab, position, rotation)

ליצור מופע מתוך Prefab.

```csharp
using UnityEngine;
public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private GameObject bulletPrefab;
    public void Fire()
    {
        if (bulletPrefab == null) return;
        GameObject bullet = Instantiate(
            bulletPrefab, transform.position, transform.rotation);
        Debug.Log("Spawned " + bullet.name);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.Instantiate.html

**דגשים חשובים:**

- אובייקט שיצרנו בזמן ריצה לא נשמר אוטומטית בקובץ הסצנה.
- יצירה תכופה במיוחד יכולה לגרום להקצאות; שימוש חוזר עם pooling עשוי לעזור.

## איך משמידים אובייקט?

Destroy מסמן אובייקט להריסה; SetActive רק משבית.

**קטגוריה:** אובייקטים

### Destroy

השמדה לאחר פרק זמן.

```csharp
using UnityEngine;
public class DestroyAfterTime : MonoBehaviour
{
    [SerializeField] private float lifetime = 3f;
    void Start() => Destroy(gameObject, lifetime);
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.Destroy.html

### SetActive(false)

השבתה לשימוש חוזר בלי להרוס.

```csharp
using UnityEngine;
public class ReusableEffect : MonoBehaviour
{
    public void Hide() => gameObject.SetActive(false);
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.SetActive.html

**דגשים חשובים:**

- אחרי Destroy יש להסיר הפניות מרישומים כגון Dictionary/HashSet.
- Destroy מתבצע בסוף מחזור העדכון הנוכחי ולא בהכרח ברגע הקריאה.

## איך עושים פעולה עם השהיה?

Coroutine מחלקת פעולה לאורך פריימים בלי לחסום את לולאת המשחק.

**קטגוריה:** מחזור חיים

### IEnumerator + WaitForSeconds

המתנה בזמן משחק.

```csharp
using System.Collections;
using UnityEngine;
public class DelayDemo : MonoBehaviour
{
    public void Begin() => StartCoroutine(ShowAfterDelay());

    private IEnumerator ShowAfterDelay()
    {
        yield return new WaitForSeconds(2f);
        Debug.Log("2 game-time seconds later");
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.StartCoroutine.html

**דגשים חשובים:**

- `WaitForSeconds` מושפע מ־Time.timeScale; אפשר להשתמש ב־`WaitForSecondsRealtime` לזמן אמיתי.
- Coroutine איננה thread נפרד.

## איך עוברים בין Scenes?

SceneManager מספק טעינה סינכרונית ואסינכרונית.

**קטגוריה:** סצנות

### LoadScene

מעבר בסיסי לפי שם סצנה.

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;
public class SceneLoader : MonoBehaviour
{
    public void GoToMenu() => SceneManager.LoadScene("MainMenu");
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SceneManagement.SceneManager.LoadScene.html

### LoadSceneAsync

להתחיל טעינת סצנה אסינכרונית.

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;
public class AsyncLoader : MonoBehaviour
{
    public void LoadLevel()
    {
        AsyncOperation loading = SceneManager.LoadSceneAsync("Level1");
        if (loading == null) Debug.LogError("Load failed");
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SceneManagement.SceneManager.LoadSceneAsync.html

**דגשים חשובים:**

- יש לכלול את הסצנה ברשימת הסצנות שנכללות בבילד (Build Profiles / Build Settings בהתאם לגרסה).
- אסינכרוני לא אומר שאין צורך לנהל זיכרון או מעבר בין שלבים.

## איך מזיזים או מסובבים Transform?

מיקום, סיבוב וסקייל הם רכיבי Transform. תנועה עם פיזיקה דורשת שיקולים אחרים.

**קטגוריה:** תנועה

### Translate + deltaTime

תנועה פשוטה שאינה פיזיקלית.

```csharp
using UnityEngine;
public class SimpleMover : MonoBehaviour
{
    [SerializeField] private float speed = 3f;
    void Update()
    {
        transform.Translate(Vector3.forward * (speed * Time.deltaTime));
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Transform.Translate.html

### MoveTowards

התקרבות לנקודת יעד בלי לעבור אותה.

```csharp
using UnityEngine;
public class FollowTarget : MonoBehaviour
{
    [SerializeField] private Transform target;
    [SerializeField] private float speed = 3f;
    void Update()
    {
        if (target == null) return;
        transform.position = Vector3.MoveTowards(
            transform.position, target.position, speed * Time.deltaTime);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Vector3.MoveTowards.html

**דגשים חשובים:**

- `deltaTime` מתקן תלות בקצב הפריימים בתנועה המתבצעת ב־Update.
- ל־Rigidbody דינמי העדיפו ממשקי תנועה פיזיקליים מתאימים ולא שינוי Transform ישיר ללא שיקול.

## איך מאזינים לאירוע בין קומפוננטות?

מנגנון אירועים מפחית polling ומאפשר עדכון של כמה מאזינים.

**קטגוריה:** תקשורת

### C# event Action

Producer שולח אירוע; Listener נרשם ומסיר הרשמה.

```csharp
using System;
using UnityEngine;

public class Health : MonoBehaviour
{
    public event Action Died;
    public void Die() => Died?.Invoke();
}

public class DeathLogger : MonoBehaviour
{
    [SerializeField] private Health health;
    void OnEnable()
    {
        if (health != null) health.Died += OnDied;
    }
    void OnDisable()
    {
        if (health != null) health.Died -= OnDied;
    }
    private void OnDied() => Debug.Log("Died!");
}
```

**דגשים חשובים:**

- להתנתק מאירוע ב־OnDisable/OnDestroy לפי אורך החיים.
- הקוד מציג שני MonoBehaviours; שמור אותם בקבצים נפרדים בשם המחלקה עבור פרויקט Unity רגיל.

## איך מחברים Button לפעולה?

אפשר לקשר OnClick ב־Inspector או מתוך קוד. ב־uGUI נעבוד עם UnityEngine.UI.

**קטגוריה:** UI

### Button.onClick.AddListener

חיבור והסרת מאזין בקוד.

```csharp
using UnityEngine;
using UnityEngine.UI;
public class MenuButton : MonoBehaviour
{
    [SerializeField] private Button playButton;
    void OnEnable()
    {
        if (playButton != null) playButton.onClick.AddListener(Play);
    }
    void OnDisable()
    {
        if (playButton != null) playButton.onClick.RemoveListener(Play);
    }
    private void Play() => Debug.Log("Play!");
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/UI.Button-onClick.html

**דגשים חשובים:**

- יש לחבר את הכפתור דרך Inspector או דרך רישום שנוצר בזמן ריצה.
- UI Toolkit משתמש במנגנון שונה מ־uGUI.

## איך מדפיסים ומאתרים באגים?

Debug.Log מיועד לניטור; Debug.Assert ובדיקות null עוזרים לזהות בעיות מוקדם.

**קטגוריה:** פיתוח

### Debug.Log / Warning / Error

הדפסה מדורגת ל־Console.

```csharp
using UnityEngine;
public class DebugExample : MonoBehaviour
{
    [SerializeField] private GameObject target;
    void Start()
    {
        Debug.Log("Starting...", this);
        if (target == null) Debug.LogWarning("Target missing", this);
        else Debug.Log("Found: " + target.name, target);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Debug.Log.html

### Debug.Assert

התרעה על הנחה שלא מתקיימת בזמן בדיקות.

```csharp
using UnityEngine;
public class AssertExample : MonoBehaviour
{
    [SerializeField] private Rigidbody body;
    void Awake()
    {
        Debug.Assert(body != null, "Rigidbody reference is required", this);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Debug.Assert.html

**דגשים חשובים:**

- לוג ב־Update עלול ליצור רעש ועלות ביצועים גבוהה.
- אפשר ללחוץ על שם האובייקט המקושר ללוג כדי לזהות את מקורו ב־Editor.

## איך מזהים התנגשות או Trigger?

Collision מתאר מגע פיזיקלי, ו־Trigger משמש זיהוי כניסה/יציאה בלי מגע פיזיקלי רגיל.

**קטגוריה:** פיזיקה

### OnTriggerEnter (3D)

לזהות כניסת Collider ל־Trigger.

```csharp
using UnityEngine;
public class PickupZone : MonoBehaviour
{
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
            Debug.Log("Player entered pickup zone");
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.OnTriggerEnter.html

### OnTriggerEnter2D

המקבילה למערכת Physics 2D.

```csharp
using UnityEngine;
public class PickupZone2D : MonoBehaviour
{
    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
            Debug.Log("Player entered 2D trigger");
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.OnTriggerEnter2D.html

**דגשים חשובים:**

- יש צורך בהגדרת Colliders ובתנאי Rigidbody/Physics מתאימים לשליחת callbacks.
- קוד 2D משתמש ב־Collider2D ו־Rigidbody2D, לא בסוגי 3D.

## איך מחפשים בתוך List בעזרת C#?

LINQ מאפשר לסנן אוספים בזיכרון; הוא לא מחליף את מנגנון החיפוש של Unity בסצנה.

**קטגוריה:** מבני נתונים

### FirstOrDefault + Where

שאילתות קצרות על רשימה קיימת.

```csharp
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
public class ListFilter : MonoBehaviour
{
    private List<int> scores = new() { 10, 15, 30 };
    void Start()
    {
        int firstHigh = scores.FirstOrDefault(x => x >= 20);
        List<int> high = scores.Where(x => x >= 15).ToList();
        Debug.Log($"First: {firstHigh}, Count: {high.Count}");
    }
}
```

**דגשים חשובים:**

- `FirstOrDefault` מחזיר default אם אין התאמה (ל־int זה 0).
- בסביבות ביצועים רגישות כמו Update שימו לב להקצאות ולסריקה.

## איך בודקים אם אובייקט קיים?

ב־Unity אובייקט שהושמד יכול להתנהג אחרת מבדיקת null רגילה של C#.

**קטגוריה:** אובייקטים

### obj == null

לבדוק UnityEngine.Object לפני שימוש.

```csharp
using UnityEngine;
public class NullCheckDemo : MonoBehaviour
{
    [SerializeField] private GameObject target;
    void Start()
    {
        if (target == null)
        {
            Debug.LogWarning("Missing or destroyed object");
            return;
        }
        Debug.Log(target.name);
    }
}
```

**דגשים חשובים:**

- ב־UnityEngine.Object, האופרטור `== null` מטפל גם באובייקט Unity שהושמד.
- `?.` ו־`??` הם אופרטורי C# רגילים ולא מחליפים תמיד בדיקת ה־null הייחודית של Unity.

## איך נמנעים מחיפושים יקרים בכל Frame?

חיפוש בסצנה בעלות חוזרת אינו שקול לקריאת הפניה שמורה.

**קטגוריה:** ביצועים

### Cache in Awake / Start

אוספים קומפוננטה פעם אחת ומשתמשים בה בהמשך.

```csharp
using UnityEngine;
public class CachedMovement : MonoBehaviour
{
    private Rigidbody body;
    void Awake() => body = GetComponent<Rigidbody>();
    void FixedUpdate()
    {
        if (body != null) body.AddForce(Vector3.forward);
    }
}
```

### מה לא לעשות

דוגמה מכוונת לאנטי־פטרן.

```csharp
// Avoid this inside Update():
void Update()
{
    GameObject player = GameObject.Find("Player");
    // Searches the loaded scene every frame.
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/GameObject.Find.html

**דגשים חשובים:**

- שקלו קישור ידני, DI, רישום או אירועים כשכמות החיפושים גדלה.
- אל תבנו מערכת Singleton גלובלית רק כדי להחליף GetComponent מקומי אחד.

## מתי משתמשים ב־Tag וב־CompareTag?

Tag שימושי לסיווג GameObject בזמן אינטראקציה, לא בהכרח לאחסון הפניות.

**קטגוריה:** אובייקטים

### CompareTag

בדיקת זהות קבוצתית על אובייקט שכבר קיבלנו.

```csharp
using UnityEngine;
public class TriggerTagCheck : MonoBehaviour
{
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
            Debug.Log("Player detected");
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Component.CompareTag.html

**דגשים חשובים:**

- Tag צריך להיות מוגדר ב־Tag Manager לפני השימוש.
- לא כל פרויקט צריך מערכת Tags גדולה; רכיב ייעודי יכול לייצג תפקיד בצורה טיפוסית.

## איך בונים Registry מסודר ל־UI?

חיבור Inspector לרשימה ולאחר מכן שימוש ב־Dictionary לסיווג מסכים.

**קטגוריה:** ארכיטקטורה

### Enum → GameObject mapping

מונע תלות בשמות טקסטואליים של GameObjects.

```csharp
using System;
using System.Collections.Generic;
using UnityEngine;
public enum PageId { Main, Settings, About }

[Serializable]
public class PageEntry
{
    public PageId id;
    public GameObject view;
}

public class PageRegistry : MonoBehaviour
{
    [SerializeField] private List<PageEntry> pages = new();
    private readonly Dictionary<PageId, GameObject> map = new();

    void Awake()
    {
        foreach (var page in pages)
            if (page.view != null) map[page.id] = page.view;
    }

    public void Show(PageId id)
    {
        if (map.TryGetValue(id, out var view) && view != null)
            view.SetActive(true);
    }
}
```

**דגשים חשובים:**

- הדוגמה דומה לדפוס שימושי בתפריטים של משחקי Unity, אך לא כוללת מנגנון ניווט מלא.
- ל־PageId כפול יש דריסת ערך במילון — רצוי להוסיף ולידציה ל־Inspector.

## איך מפרידים נתוני הגדרה מ־GameObject?

ScriptableObject שומר נתונים כאסיסט שאפשר לשתף בין מופעים.

**קטגוריה:** ארכיטקטורה

### CreateAssetMenu + ScriptableObject

הגדרות נשק שמתקיימות כנכס Project.

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "Game/Weapon Config")]
public class WeaponConfig : ScriptableObject
{
    public string displayName;
    public float damage = 10f;
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/ScriptableObject.html

**דגשים חשובים:**

- שמור את הקוד בקובץ WeaponConfig.cs; צור Asset מתוך Create menu.
- שינוי ערכי ScriptableObject בזמן Play עשוי להשפיע על הנכס/מצב ה־Editor ולכן יש להבחין בין config ל־runtime state.

## איך שומרים מנהל בין סצנות?

DontDestroyOnLoad מונע השמדה של GameObject בשינוי סצנה, אך מחייב מניעת כפילויות.

**קטגוריה:** סצנות

### DontDestroyOnLoad

שמירת רכיב שורשי בין טעינות.

```csharp
using UnityEngine;
public class PersistentMusic : MonoBehaviour
{
    private static PersistentMusic instance;
    void Awake()
    {
        if (instance != null && instance != this)
        {
            Destroy(gameObject);
            return;
        }
        instance = this;
        DontDestroyOnLoad(gameObject);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.DontDestroyOnLoad.html

**דגשים חשובים:**

- עדיף להפעיל על אובייקט שורש (root) כדי למנוע הפתעות.
- לא כל Service צריך להיות Singleton או לחיות בין סצנות.

## איך משתמשים מחדש באובייקטים?

Pooling מפחית Instantiate/Destroy חוזרים, אבל מחייב איפוס מצב לפני שימוש חוזר.

**קטגוריה:** ביצועים

### ObjectPool<T>

מאגר בסיסי לאפקטים או קליעים.

```csharp
using UnityEngine;
using UnityEngine.Pool;
public class BulletPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    private ObjectPool<GameObject> pool;

    void Awake()
    {
        pool = new ObjectPool<GameObject>(
            createFunc: () => Instantiate(prefab),
            actionOnGet: obj => obj.SetActive(true),
            actionOnRelease: obj => obj.SetActive(false),
            actionOnDestroy: obj => Destroy(obj),
            collectionCheck: true,
            defaultCapacity: 10,
            maxSize: 100);
    }
    public GameObject Take() => pool.Get();
    public void Return(GameObject obj) => pool.Release(obj);
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Pool.ObjectPool_1.html

**דגשים חשובים:**

- יש לוודא שלא מחזירים את אותו אובייקט למאגר פעמיים.
- בדוגמה צריך לאפס מיקום, מהירות, טיימרים ואירועים של כדור בעת שליפה/החזרה לפי המשחק.

## איך מקבלים את כל האובייקטים מסוג מסוים?

חיפוש לכל הקומפוננטות מסוג T, עם בחירה האם לכלול אובייקטים כבויים והאם למיין.

**קטגוריה:** אובייקטים

### FindObjectsByType<T>

חיפוש כל המופעים הטעונים מהטיפוס.

```csharp
using UnityEngine;
public class AllAudioSources : MonoBehaviour
{
    void Start()
    {
        AudioSource[] sources = FindObjectsByType<AudioSource>(
            FindObjectsInactive.Include, FindObjectsSortMode.None);
        foreach (var source in sources) Debug.Log(source.name);
    }
}
```

**Unity Docs:** https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.FindObjectsByType.html

**דגשים חשובים:**

- בחירת `FindObjectsSortMode.None` חוסכת את עלות המיון כאשר הסדר לא משנה.
- לא מיועד לשליפה בכל פריים.

## איך מנהלים רישום אובייקטים דינמי?

אובייקט שנוצר או הושמד יכול להירשם ולהסיר את עצמו מ־Registry; כך אין צורך בסריקה חוזרת.

**קטגוריה:** ארכיטקטורה

### OnEnable / OnDisable registration

ניהול אוסף של אויבים פעילים.

```csharp
using System.Collections.Generic;
using UnityEngine;
public class EnemyRegistry : MonoBehaviour
{
    public static readonly HashSet<EnemyMarker> Active = new();
}

public class EnemyMarker : MonoBehaviour
{
    void OnEnable() => EnemyRegistry.Active.Add(this);
    void OnDisable() => EnemyRegistry.Active.Remove(this);
}
```

**דגשים חשובים:**

- הדוגמה משתמשת באוסף static פשוט ללמידה; בפרויקט גדול העדיפו Service עם מחזור חיים מבוקר/DI.
- OnDisable מסיר גם כשה־GameObject נכבה וגם בזמן השמדתו.