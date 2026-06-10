const fs = require('fs');

const path = 'c:\\Users\\Bhush\\Desktop\\FresherX\\app\\app\\(recruiter)\\analytics\\index.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Import FlashList
code = code.replace(
  "import { LineChart, BarChart } from 'react-native-gifted-charts';",
  "import { LineChart, BarChart } from 'react-native-gifted-charts';\nimport { FlashList } from '@shopify/flash-list';"
);

// 2. Replace ScrollView start
code = code.replace(
  "<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>",
  `<FlashList
        data={topJobs || []}
        estimatedItemSize={80}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>`
);

// 3. Replace Top performing jobs start
code = code.replace(
  `        {/* Top performing jobs */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Top Performing Jobs
          </Text>
          {topJobs.map((job, i) => (`,
  `        {/* Top performing jobs Header */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.section, { paddingBottom: 12 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
            Top Performing Jobs
          </Text>
        </Animated.View>
          </>
        }
        renderItem={({ item: job, index: i }) => (
          <View style={{ paddingBottom: 10 }}>`
);

// 4. Replace ScrollView end
code = code.replace(
  `          ))}
          {topJobs.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Post jobs to see performance analytics
            </Text>
          )}
        </Animated.View>
      </ScrollView>`,
  `          </View>
        )}
        ListFooterComponent={
          topJobs.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Post jobs to see performance analytics
            </Text>
          ) : null
        }
      />`
);

fs.writeFileSync(path, code);
console.log('Analytics refactored successfully.');
